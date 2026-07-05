"use client"

import React, { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { Header } from "../components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { FolderKanban, Plus, MoreVertical, Trash2, Kanban, CheckSquare, Users } from "lucide-react"
import { useProjects, useCreateProject, useDeleteProject } from "../hooks/useProjects"
import { teamsAPI } from "../services/api"
import type { Project } from "../types/project"

interface CreateProjectForm {
  name: string
  key: string
  description: string
  team_id: string // "personal" or team id as string (Radix Select works with strings)
}

const KEY_REGEX = /^[A-Z][A-Z0-9]{1,7}$/

const ProjectsPage = () => {
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const { data: projects = [], isLoading } = useProjects()
  const createProject = useCreateProject()
  const deleteProject = useDeleteProject()

  const { data: teamsData } = useQuery({
    queryKey: ["teams"],
    queryFn: teamsAPI.getTeams,
    staleTime: 5 * 60 * 1000,
  })
  const teams: { id: number; name: string }[] = teamsData?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectForm>({
    defaultValues: { name: "", key: "", description: "", team_id: "personal" },
  })

  const onSubmit = (form: CreateProjectForm) => {
    createProject.mutate(
      {
        name: form.name.trim(),
        key: form.key.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        team_id: form.team_id === "personal" ? null : Number(form.team_id),
      },
      {
        onSuccess: () => {
          reset()
          setCreateOpen(false)
        },
      },
    )
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteProject.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  return (
    <div className="min-h-screen bg-[#050816]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-600/20 rounded-xl">
              <FolderKanban className="h-6 w-6 text-violet-400" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Projects</h1>
              <p className="text-sm text-slate-400">
                Group boards under a project key — every task gets an issue key like{" "}
                <span className="font-mono text-violet-400">TF-123</span>
              </p>
            </div>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            New Project
          </Button>
        </div>

        {/* Project grid */}
        {isLoading ? (
          <p className="text-slate-400">Loading projects…</p>
        ) : projects.length === 0 ? (
          <Card className="bg-[#0d1224] border border-white/[0.06] rounded-2xl">
            <CardContent className="py-16 text-center space-y-3">
              <FolderKanban className="h-10 w-10 text-slate-600 mx-auto" aria-hidden="true" />
              <p className="text-slate-400">No projects yet. Create one to start using issue keys.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project: Project) => (
              <Card
                key={project.id}
                className="bg-[#0d1224] hover:bg-[#111827] border border-white/[0.06] hover:border-white/[0.10] rounded-2xl transition-all duration-200 group"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge className="bg-violet-600/20 text-violet-300 border-0 font-mono font-bold shrink-0">
                        {project.key}
                      </Badge>
                      <CardTitle className="text-base text-white truncate group-hover:text-violet-300 transition-colors">
                        {project.name}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Options for ${project.name}`}
                          className="h-7 w-7 p-0 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg"
                        >
                          <MoreVertical className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#0d1224] border border-white/10 shadow-xl rounded-xl"
                      >
                        <DropdownMenuItem
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer rounded-lg mx-1 my-1 focus:bg-red-500/10 focus:text-red-300"
                          onClick={() => setDeleteTarget(project)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Kanban className="h-3.5 w-3.5" aria-hidden="true" />
                      {project.boards_count ?? 0} boards
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
                      {project.tasks_count ?? 0} issues
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      {project.team?.name ?? "Personal"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create project dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => !open && setCreateOpen(false)}>
        <DialogContent className="max-w-md bg-[#0d1224] border border-white/10 rounded-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Create Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="project-name" className="text-sm font-medium text-slate-300">
                Name
              </label>
              <Input
                id="project-name"
                placeholder="e.g. TaskFlow Mobile"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                {...register("name", {
                  required: "Project name is required",
                  maxLength: { value: 255, message: "Max 255 characters" },
                  onChange: (e) => {
                    // Suggest a key from the name initials until the user edits the key
                    const initials = (e.target.value as string)
                      .split(/[^A-Za-z0-9]+/)
                      .filter(Boolean)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .replace(/[^A-Z]/g, "")
                      .slice(0, 5)
                    if (initials.length >= 2) setValue("key", initials)
                  },
                })}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="project-key" className="text-sm font-medium text-slate-300">
                Key <span className="text-slate-500">(used in issue keys, immutable)</span>
              </label>
              <Input
                id="project-key"
                placeholder="e.g. TFM"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 font-mono uppercase"
                {...register("key", {
                  required: "Project key is required",
                  pattern: {
                    value: KEY_REGEX,
                    message: "2–8 chars, A–Z and digits, must start with a letter",
                  },
                  setValueAs: (v: string) => v.toUpperCase(),
                })}
              />
              {errors.key && <p className="text-xs text-red-400">{errors.key.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="project-team" className="text-sm font-medium text-slate-300">
                Team
              </label>
              <Controller
                name="team_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="project-team" className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Personal" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1224] border border-white/10 text-white">
                      <SelectItem value="personal">Personal (just me)</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={String(team.id)}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="project-description" className="text-sm font-medium text-slate-300">
                Description <span className="text-slate-500">(optional)</span>
              </label>
              <Textarea
                id="project-description"
                rows={2}
                placeholder="What is this project about?"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                {...register("description", { maxLength: { value: 2000, message: "Max 2000 characters" } })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProject.isPending}
                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold"
              >
                {createProject.isPending ? "Creating…" : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm bg-[#0d1224] border border-white/10 rounded-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete “{deleteTarget?.name}”?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            The project will be removed. Boards and tasks keep their issue keys, but the project grouping is
            lost.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              className="text-slate-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteProject.isPending}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold"
            >
              {deleteProject.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectsPage
