import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { workflowAPI } from "../services/api"
import type { Status, Transition } from "../types/project"

export const workflowKeys = {
  statuses: (projectId: number | string) => ["projects", projectId, "statuses"] as const,
  transitions: (projectId: number | string) => ["projects", projectId, "transitions"] as const,
  taskTransitions: (taskId: number | string) => ["tasks", taskId, "transitions"] as const,
}

export const useProjectStatuses = (projectId?: number | string | null) => {
  return useQuery({
    queryKey: workflowKeys.statuses(projectId ?? ""),
    queryFn: () => workflowAPI.getStatuses(projectId!),
    enabled: !!projectId,
    staleTime: 60 * 1000,
    select: (res): Status[] => res?.data ?? [],
  })
}

export const useProjectTransitions = (projectId?: number | string | null) => {
  return useQuery({
    queryKey: workflowKeys.transitions(projectId ?? ""),
    queryFn: () => workflowAPI.getTransitions(projectId!),
    enabled: !!projectId,
    staleTime: 60 * 1000,
    select: (res): Transition[] => res?.data ?? [],
  })
}

export const useCreateStatus = (projectId: number | string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; category: string }) => workflowAPI.createStatus(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.statuses(projectId) })
      queryClient.invalidateQueries({ queryKey: workflowKeys.transitions(projectId) })
    },
  })
}

export const useDeleteStatus = (projectId: number | string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ statusId, moveToStatusId }: { statusId: number; moveToStatusId: number }) =>
      workflowAPI.deleteStatus(statusId, moveToStatusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.statuses(projectId) })
      queryClient.invalidateQueries({ queryKey: workflowKeys.transitions(projectId) })
    },
  })
}

export const useCreateTransition = (projectId: number | string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { from_status_id?: number | null; to_status_id: number; allowed_roles?: string[] }) =>
      workflowAPI.createTransition(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.transitions(projectId) })
    },
  })
}

export const useDeleteTransition = (projectId: number | string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transitionId: number) => workflowAPI.deleteTransition(transitionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.transitions(projectId) })
    },
  })
}
