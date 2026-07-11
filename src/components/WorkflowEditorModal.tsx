"use client"

import * as React from "react"
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Separator } from "./ui/separator"
import { ArrowRight, Plus, Trash2, GitBranch, Lock } from "lucide-react"
import { toast } from "sonner"
import {
  useProjectStatuses,
  useProjectTransitions,
  useCreateStatus,
  useDeleteStatus,
  useCreateTransition,
  useDeleteTransition,
} from "../hooks/useWorkflow"
import { STATUS_CATEGORIES } from "../types/project"
import type { Project, Status, StatusCategory, Transition } from "../types/project"

interface WorkflowEditorModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

interface AddStatusForm {
  name: string
  category: StatusCategory
}

interface AddTransitionForm {
  from_status_id: string // "any" or status id
  to_status_id: string
  adminOnly: boolean
}

const categoryColor = (category: StatusCategory): string =>
  STATUS_CATEGORIES.find((c) => c.value === category)?.color ?? "#64748b"

export function WorkflowEditorModal({ project, isOpen, onClose }: WorkflowEditorModalProps) {
  const [deleteStatusTarget, setDeleteStatusTarget] = useState<Status | null>(null)
  const [moveToStatusId, setMoveToStatusId] = useState<string>("")

  const { data: statuses = [] } = useProjectStatuses(isOpen ? project.id : null)
  const { data: transitions = [] } = useProjectTransitions(isOpen ? project.id : null)

  const createStatus = useCreateStatus(project.id)
  const deleteStatus = useDeleteStatus(project.id)
  const createTransition = useCreateTransition(project.id)
  const deleteTransition = useDeleteTransition(project.id)

  const statusForm = useForm<AddStatusForm>({ defaultValues: { name: "", category: "todo" } })
  const transitionForm = useForm<AddTransitionForm>({
    defaultValues: { from_status_id: "any", to_status_id: "", adminOnly: false },
  })

  const apiError = (error: unknown, fallback: string) => {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
    toast.error(message || fallback)
  }

  const onAddStatus = (form: AddStatusForm) => {
    createStatus.mutate(
      { name: form.name.trim(), category: form.category },
      {
        onSuccess: () => statusForm.reset(),
        onError: (error) => apiError(error, "Failed to create status"),
      },
    )
  }

  const onAddTransition = (form: AddTransitionForm) => {
    if (!form.to_status_id) {
      toast.error("Pick a target status")
      return
    }
    createTransition.mutate(
      {
        from_status_id: form.from_status_id === "any" ? null : Number(form.from_status_id),
        to_status_id: Number(form.to_status_id),
        ...(form.adminOnly && { allowed_roles: ["owner", "admin"] }),
      },
      {
        onSuccess: () => transitionForm.reset(),
        onError: (error) => apiError(error, "Failed to create transition"),
      },
    )
  }

  const confirmDeleteStatus = () => {
    if (!deleteStatusTarget || !moveToStatusId) return
    deleteStatus.mutate(
      { statusId: deleteStatusTarget.id, moveToStatusId: Number(moveToStatusId) },
      {
        onSuccess: () => {
          setDeleteStatusTarget(null)
          setMoveToStatusId("")
        },
        onError: (error) => apiError(error, "Failed to delete status"),
      },
    )
  }

  const statusName = (id: number | null): string =>
    id === null ? "Any status" : (statuses.find((s: Status) => s.id === id)?.name ?? `#${id}`)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0d1224] border border-white/10 rounded-2xl text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <GitBranch className="h-5 w-5 text-violet-400" aria-hidden="true" />
            Workflow — {project.name}
            <Badge className="bg-violet-600/20 text-violet-300 border-0 font-mono">{project.key}</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* ── Statuses ── */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">Statuses</h3>
          <div className="space-y-1.5">
            {statuses.map((status: Status) => (
              <div
                key={status.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: categoryColor(status.category) }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{status.name}</span>
                <span className="text-xs text-slate-500">{status.category.replace("_", " ")}</span>
                {status.is_default && (
                  <Badge className="bg-white/10 text-slate-300 border-0 text-[10px]">default</Badge>
                )}
                {!status.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete status ${status.name}`}
                    className="ml-auto h-7 w-7 p-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                    onClick={() => {
                      setDeleteStatusTarget(status)
                      setMoveToStatusId("")
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Inline reassign-and-delete confirmation */}
          {deleteStatusTarget && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
              <p className="text-xs text-red-300">
                Delete “{deleteStatusTarget.name}” — where should its tasks and columns go?
              </p>
              <div className="flex items-center gap-2">
                <Select value={moveToStatusId} onValueChange={setMoveToStatusId}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs flex-1">
                    <SelectValue placeholder="Move tasks to…" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1224] border border-white/10 text-white">
                    {statuses
                      .filter((s: Status) => s.id !== deleteStatusTarget.id)
                      .map((s: Status) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={!moveToStatusId || deleteStatus.isPending}
                  onClick={confirmDeleteStatus}
                  className="bg-red-600 hover:bg-red-500 text-white h-8"
                >
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteStatusTarget(null)}
                  className="text-slate-400 hover:text-white h-8"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={statusForm.handleSubmit(onAddStatus)} className="flex items-center gap-2">
            <Input
              placeholder="New status name…"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-9 flex-1"
              {...statusForm.register("name", { required: true, maxLength: 100 })}
            />
            <Controller
              name="category"
              control={statusForm.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1224] border border-white/10 text-white">
                    {STATUS_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Button
              type="submit"
              size="sm"
              disabled={createStatus.isPending}
              className="bg-violet-600 hover:bg-violet-500 text-white h-9"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </section>

        <Separator className="bg-white/[0.06]" />

        {/* ── Transitions ── */}
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Transitions</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              “Any status” rules keep the board unrestricted. Delete them and add specific rules to enforce a
              strict flow.
            </p>
          </div>
          <div className="space-y-1.5">
            {transitions.map((transition: Transition) => (
              <div
                key={transition.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm"
              >
                <span className={transition.from_status_id === null ? "text-slate-500 italic" : ""}>
                  {statusName(transition.from_status_id)}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" aria-hidden="true" />
                <span>{statusName(transition.to_status_id)}</span>
                {transition.allowed_roles && transition.allowed_roles.length > 0 && (
                  <Badge className="bg-amber-500/15 text-amber-300 border-0 text-[10px] gap-1">
                    <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                    {transition.allowed_roles.join(", ")}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Delete transition"
                  className="ml-auto h-7 w-7 p-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                  onClick={() =>
                    deleteTransition.mutate(transition.id, {
                      onError: (error) => apiError(error, "Failed to delete transition"),
                    })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            ))}
            {transitions.length === 0 && (
              <p className="text-xs text-amber-400 px-1">
                No transitions defined — nothing can move between statuses. Add at least one rule.
              </p>
            )}
          </div>

          <form
            onSubmit={transitionForm.handleSubmit(onAddTransition)}
            className="flex flex-wrap items-center gap-2"
          >
            <Controller
              name="from_status_id"
              control={transitionForm.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 w-36">
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1224] border border-white/10 text-white">
                    <SelectItem value="any">Any status</SelectItem>
                    {statuses.map((s: Status) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <ArrowRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <Controller
              name="to_status_id"
              control={transitionForm.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 w-36">
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1224] border border-white/10 text-white">
                    {statuses.map((s: Status) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" className="accent-violet-600" {...transitionForm.register("adminOnly")} />
              Admins only
            </label>
            <Button
              type="submit"
              size="sm"
              disabled={createTransition.isPending}
              className="bg-violet-600 hover:bg-violet-500 text-white h-9 ml-auto"
            >
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Add Rule
            </Button>
          </form>
        </section>
      </DialogContent>
    </Dialog>
  )
}
