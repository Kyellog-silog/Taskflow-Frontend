import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { projectsAPI } from "../services/api"
import type { CreateProjectRequest, Label, Project } from "../types/project"

// Query key factory — keeps keys consistent across invalidations
export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: number | string) => [...projectKeys.all, id] as const,
  labels: (projectId: number | string) => [...projectKeys.all, projectId, "labels"] as const,
}

export const useProjects = () => {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: projectsAPI.getProjects,
    staleTime: 60 * 1000,
    select: (res): Project[] => res?.data ?? [],
  })
}

export const useProject = (id?: number | string) => {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ""),
    queryFn: () => projectsAPI.getProject(id!),
    enabled: !!id,
    select: (res): Project => res?.data,
  })
}

export const useProjectLabels = (projectId?: number | string | null) => {
  return useQuery({
    queryKey: projectKeys.labels(projectId ?? ""),
    queryFn: () => projectsAPI.getLabels(projectId!),
    enabled: !!projectId,
    staleTime: 60 * 1000,
    select: (res): Label[] => res?.data ?? [],
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsAPI.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => projectsAPI.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export const useCreateLabel = (projectId: number | string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; color?: string }) => projectsAPI.createLabel(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.labels(projectId) })
    },
  })
}

export const useDeleteLabel = (projectId: number | string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (labelId: number) => projectsAPI.deleteLabel(labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.labels(projectId) })
    },
  })
}
