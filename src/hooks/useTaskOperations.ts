// Enhanced task movement hook with operation tracking and conflict resolution
import { useState, useRef, useCallback } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useToast } from './use-toast'
import { tasksAPI } from '../services/api'
import logger from '../lib/logger'

interface PendingOperation {
  id: string
  taskId: string
  timestamp: number
  type: 'move' | 'update'
  data: any
}

interface UseTaskOperationsProps {
  boardId: string | undefined
}

export const useTaskOperations = ({ boardId }: UseTaskOperationsProps) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [pendingOperations, setPendingOperations] = useState<Map<string, PendingOperation>>(new Map())
  const operationCounter = useRef(0)
  const lastMoveTime = useRef<Record<string, number>>({})
  const debouncedMovesRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const rollbackDataRef = useRef<Record<string, any>>({})

  // Generate unique operation ID
  const generateOperationId = () => {
    operationCounter.current += 1
    return `op-${Date.now()}-${operationCounter.current}`
  }

  // Track pending operation
  const addPendingOperation = (taskId: string, type: 'move' | 'update', data: any) => {
    const operationId = generateOperationId()
    const operation: PendingOperation = {
      id: operationId,
      taskId,
      timestamp: Date.now(),
      type,
      data
    }
    
    setPendingOperations(prev => new Map(prev).set(operationId, operation))
    return operationId
  }

  // Remove pending operation
  const removePendingOperation = (operationId: string) => {
    setPendingOperations(prev => {
      const newMap = new Map(prev)
      newMap.delete(operationId)
      return newMap
    })
  }

  // Check if task has pending operations
  const hasPendingOperations = (taskId: string) => {
    return Array.from(pendingOperations.values()).some(op => op.taskId === taskId)
  }

  // Enhanced move task mutation with conflict resolution
  const moveTaskMutation = useMutation(
    async ({ 
      taskId, 
      columnId, 
      position, 
      operationId, 
      clientTimestamp 
    }: { 
      taskId: string
      columnId: string
      position: number
      operationId: string
      clientTimestamp: number
    }) => {
      return await tasksAPI.moveTask(taskId, columnId, position, {
        operation_id: operationId,
        client_timestamp: clientTimestamp
      })
    },
    {
      onSuccess: (data, variables) => {
        removePendingOperation(variables.operationId)
        delete rollbackDataRef.current[variables.taskId]

        // Only update cache if no newer operations are pending for this task
        if (!hasPendingOperations(variables.taskId)) {
          queryClient.setQueryData(["tasks", boardId], (oldData: any) => {
            if (!oldData?.data) return oldData

            return {
              ...oldData,
              data: oldData.data.map((task: any) =>
                task.id === variables.taskId ? { ...task, ...data.data } : task
              )
            }
          })
        }
      },
      onError: (error: any, variables) => {
        removePendingOperation(variables.operationId)

        // Restore the pre-move cache snapshot for instant rollback
        const rollback = rollbackDataRef.current[variables.taskId]
        if (rollback) {
          queryClient.setQueryData(["tasks", boardId], rollback)
          delete rollbackDataRef.current[variables.taskId]
        } else {
          queryClient.invalidateQueries(["tasks", boardId])
        }

        // Handle conflicts gracefully
        if (error.response?.status === 409 && error.response?.data?.conflict) {
          const conflictData = error.response.data
          logger.log('Conflict detected:', conflictData)

          if (conflictData.time_difference && conflictData.time_difference < 2000) {
            logger.log('Rapid move conflict, refreshing state silently')
            queryClient.invalidateQueries(["tasks", boardId])
            return
          }

          toast({
            title: "Task Updated by Another User",
            description: "The task was moved by someone else. Refreshing...",
            variant: "default"
          })
          queryClient.invalidateQueries(["tasks", boardId])
          return
        }

        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to move task",
          variant: "destructive",
        })
      },
    }
  )

  // Enhanced move handler with optimistic updates and operation tracking
  const handleTaskMove = useCallback((
    taskId: string,
    sourceColumn: string,
    destColumn: string,
    position: number,
    optimisticUpdateFn: (taskId: string, sourceColumn: string, destColumn: string, position: number) => void
  ) => {
    const now = Date.now()

    // 1. Cancel any in-flight refetches so they can't overwrite the optimistic state
    queryClient.cancelQueries(["tasks", boardId])

    // 2. Snapshot the cache BEFORE updating — used for rollback on error
    rollbackDataRef.current[taskId] = queryClient.getQueryData(["tasks", boardId])

    // 3. Immediately update the React Query cache (fixes navigation-revert bug)
    queryClient.setQueryData(["tasks", boardId], (old: any) => {
      if (!old?.data) return old
      return {
        ...old,
        data: old.data.map((task: any) =>
          task.id?.toString() === taskId
            ? { ...task, column_id: destColumn }
            : task
        ),
      }
    })

    // 4. Immediately update the local columns state (instant visual feedback)
    optimisticUpdateFn(taskId, sourceColumn, destColumn, position)

    // 5. Debounce the API call (80ms) — coalesces rapid moves of the same card
    //    into one request, replacing the old skip-if-<100ms logic that lost moves
    if (debouncedMovesRef.current[taskId]) {
      clearTimeout(debouncedMovesRef.current[taskId])
    }

    lastMoveTime.current[taskId] = now
    const operationId = addPendingOperation(taskId, 'move', { sourceColumn, destColumn, position })

    debouncedMovesRef.current[taskId] = setTimeout(() => {
      delete debouncedMovesRef.current[taskId]
      moveTaskMutation.mutate({
        taskId,
        columnId: destColumn,
        position,
        operationId,
        clientTimestamp: now,
      })
    }, 80)
  }, [moveTaskMutation, boardId, queryClient])

  return {
    handleTaskMove,
    pendingOperations,
    hasPendingOperations,
    isLoading: moveTaskMutation.isLoading
  }
}
