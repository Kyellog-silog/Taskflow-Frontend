import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tasksAPI } from "../services/api"


export const useTasks = (boardId?: string) => {
  const queryClient = useQueryClient()

  const tasksQuery = useQuery({
    queryKey: ["tasks", boardId],
    queryFn: () => tasksAPI.getTasks(boardId),
    enabled: !!boardId,
  })

  const createTaskMutation = useMutation({
    mutationFn: tasksAPI.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] })
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => tasksAPI.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: tasksAPI.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] })
    },
  })

  return {
    tasks: tasksQuery.data,
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  }
}
