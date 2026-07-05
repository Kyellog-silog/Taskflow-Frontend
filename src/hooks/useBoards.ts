import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { boardsAPI } from "../services/api"

export const useBoards = (type: 'active' | 'archived' | 'deleted' | 'recent' = 'active', limit?: number) => {
  const queryClient = useQueryClient()

  const boardsQuery = useQuery({
    queryKey: ["boards", type, limit],
    queryFn: () => boardsAPI.getBoards(type, limit),
    // Idle-friendly defaults; SSE will invalidate when needed
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000,
  })

  const createBoardMutation = useMutation({
    mutationFn: boardsAPI.createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] })
    },
  })

  const deleteBoardMutation = useMutation({
    mutationFn: boardsAPI.deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] })
    },
  })

  const archiveBoardMutation = useMutation({
    mutationFn: boardsAPI.archiveBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] })
    },
  })

  const unarchiveBoardMutation = useMutation({
    mutationFn: boardsAPI.unarchiveBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] })
    },
  })

  const restoreBoardMutation = useMutation({
    mutationFn: boardsAPI.restoreBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] })
    },
  })

  return {
    boards: boardsQuery.data,
    isLoading: boardsQuery.isLoading,
    error: boardsQuery.error,
    refetch: boardsQuery.refetch,
    createBoard: createBoardMutation.mutate,
    deleteBoard: deleteBoardMutation.mutate,
    archiveBoard: archiveBoardMutation.mutate,
    unarchiveBoard: unarchiveBoardMutation.mutate,
    restoreBoard: restoreBoardMutation.mutate,
    isCreating: createBoardMutation.isPending,
    isDeleting: deleteBoardMutation.isPending,
    isArchiving: archiveBoardMutation.isPending,
    isUnarchiving: unarchiveBoardMutation.isPending,
    isRestoring: restoreBoardMutation.isPending,
  }
}

// Convenience hooks for specific board types
export const useActiveBoards = (limit?: number) => useBoards('active', limit)
export const useArchivedBoards = (limit?: number) => useBoards('archived', limit)
export const useDeletedBoards = (limit?: number) => useBoards('deleted', limit)
export const useRecentBoards = (limit?: number) => useBoards('recent', limit)
