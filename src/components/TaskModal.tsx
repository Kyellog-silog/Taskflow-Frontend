"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { MessageSquare, User, Clock, Tag, Calendar, Flag, Sparkles, Send, X, Save, CornerDownRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Separator } from "./ui/separator"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { commentsAPI, projectsAPI } from "../services/api"
// SSE handled globally in App-level bridge
import logger from "../lib/logger"
import { ISSUE_TYPES, ISSUE_PRIORITIES } from "../types/project"
import type { IssueType, IssuePriority, Label as ProjectLabel } from "../types/project"

interface Task {
  id: string
  title: string
  description: string
  status: string
  columnId: string // Add this line
  priority: IssuePriority
  assignee?: {
    id: string
    name: string
    avatar: string
  }
  dueDate?: string
  comments: Comment[]
  createdAt: string
  issueKey?: string
  issueType?: IssueType
  storyPoints?: number | null
  projectId?: string | null
  labels?: ProjectLabel[]
}

interface Comment {
  id: string
  content: string
  author: {
    name: string
    avatar: string
  }
  createdAt: string
}

interface TaskModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onUpdate: (task: Task) => void
  onMove?: (taskId: string, newColumnId: string) => void // Add move callback
}

export function TaskModal({ task, isOpen, onClose, onUpdate, onMove }: TaskModalProps) {
  const [editedTask, setEditedTask] = useState<Task>(task)
  const [newComment, setNewComment] = useState("")
  const [originalStatus, setOriginalStatus] = useState(task.status)
  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  const toInputDate = (s?: string): string => {
    if (!s) return ""
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

    let d = new Date(s)
    if (isNaN(d.getTime())) {
      const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
      if (mdy) {
        const mm = parseInt(mdy[1], 10)
        const dd = parseInt(mdy[2], 10)
        let yyyy = parseInt(mdy[3], 10)
        if (yyyy < 100) yyyy += 2000
        d = new Date(yyyy, mm - 1, dd)
      } else {
        return ""
      }
    }
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }

  const inputDueDate = useMemo(() => toInputDate(editedTask.dueDate), [editedTask.dueDate])

  // Update editedTask when task prop changes
  useEffect(() => {
    logger.log("TaskModal received task:", task)
    logger.log("Task status:", task.status)
    setEditedTask(task)
    setOriginalStatus(task.status)
  }, [task])

  const handleSave = () => {
    logger.log(`Saving task. Original status: ${originalStatus}, New status: ${editedTask.status}`)
    
    // Always update the task first
    onUpdate(editedTask)
    
    // Check if status changed and trigger move if needed
    if (editedTask.status !== originalStatus && onMove) {
      logger.log(`Status changed from ${originalStatus} to ${editedTask.status}, triggering move`)
      // Small delay to ensure the update completes first
      setTimeout(() => {
        onMove(editedTask.id, editedTask.status)
      }, 100)
    }
    
    onClose()
  }

  const handleStatusChange = (newStatus: string) => {
    logger.log(`Changing task status from ${editedTask.status} to ${newStatus}`)
    setEditedTask({ ...editedTask, status: newStatus })
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "highest":
        return {
          color: "bg-gradient-to-r from-red-600 to-rose-600 text-white",
          bgColor: "from-red-500/10 to-rose-500/10",
          borderColor: "border-red-500/30",
          icon: "🔺"
        }
      case "high":
        return {
          color: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
          bgColor: "from-red-500/10 to-pink-500/10",
          borderColor: "border-red-500/20",
          icon: "🔥"
        }
      case "medium":
        return {
          color: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
          bgColor: "from-amber-500/10 to-orange-500/10",
          borderColor: "border-amber-500/20",
          icon: "⚡"
        }
      case "low":
        return {
          color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
          bgColor: "from-green-500/10 to-emerald-500/10",
          borderColor: "border-green-500/20",
          icon: "🌱"
        }
      case "lowest":
        return {
          color: "bg-gradient-to-r from-slate-500 to-slate-600 text-white",
          bgColor: "from-slate-500/10 to-gray-500/10",
          borderColor: "border-slate-500/20",
          icon: "🔽"
        }
      default:
        return {
          color: "bg-gradient-to-r from-gray-500 to-slate-500 text-white",
          bgColor: "from-gray-500/10 to-slate-500/10",
          borderColor: "border-gray-500/20",
          icon: "📋"
        }
    }
  }

  const priorityConfig = getPriorityConfig(editedTask.priority)

  // Load comments for this task
  const { data: commentsData } = useQuery({
    queryKey: ["comments", task.id],
    queryFn: () => commentsAPI.getComments(task.id),
    enabled: !!task.id,
  })

  // Labels available in this task's project
  const { data: labelsData } = useQuery({
    queryKey: ["projects", task.projectId, "labels"],
    queryFn: () => projectsAPI.getLabels(task.projectId!),
    enabled: !!task.projectId,
    staleTime: 60 * 1000,
  })
  const availableLabels: ProjectLabel[] = labelsData?.data ?? []

  const toggleLabel = (label: ProjectLabel) => {
    setEditedTask((prev) => {
      const current = prev.labels ?? []
      const has = current.some((l) => l.id === label.id)
      return { ...prev, labels: has ? current.filter((l) => l.id !== label.id) : [...current, label] }
    })
  }

  // Keep editedTask.comments in sync with fetched comments
  useEffect(() => {
    if (commentsData?.data) {
      setEditedTask((prev) => ({ ...prev, comments: commentsData.data }))
    }
  }, [commentsData])

  // Post a new top-level comment
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => commentsAPI.createComment(task.id, content),
    onSuccess: () => {
        setNewComment("")
        queryClient.invalidateQueries({ queryKey: ["comments", task.id] })
      },
  })

  // Post a reply to a comment
  const addReplyMutation = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string; content: string }) =>
      commentsAPI.createComment(task.id, content, parentId),
    onSuccess: (_res, vars) => {
        setReplyDrafts((d) => ({ ...d, [vars.parentId]: "" }))
        queryClient.invalidateQueries({ queryKey: ["comments", task.id] })
      },
  })

  // Real-time updates handled by App-level SSE bridge which invalidates ["comments", taskId]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-[#0d1224] border border-white/10 shadow-2xl text-white">
        {/* Header */}
        <DialogHeader className="pb-0">
          <div className={`p-4 -m-6 mb-4 bg-gradient-to-r ${priorityConfig.bgColor} border-b-2 ${priorityConfig.borderColor} relative overflow-hidden`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <DialogTitle className="flex items-center space-x-3 text-2xl font-bold text-white">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Tag className="h-6 w-6 text-slate-300" />
                </div>
                <span>Task Details</span>
                <div className="text-2xl">{priorityConfig.icon}</div>
              </DialogTitle>
              <p className="text-slate-400 mt-2 font-mono">
                {editedTask.issueKey || `Task ID: #${editedTask.id.slice(-8)}`}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Task Title */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-300 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Task Title</span>
            </label>
            <Input
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="text-lg font-semibold bg-white/5 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all duration-200 text-white placeholder:text-slate-500"
              placeholder="Enter task title..."
            />
          </div>

          {/* Task Description */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-300">Description</label>
            <Textarea
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              rows={4}
              className="bg-white/5 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all duration-200 text-white placeholder:text-slate-500"
              placeholder="Describe what needs to be done..."
            />
          </div>

          {/* Task Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300">Status</label>
              <Select
                value={editedTask.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="bg-white/5 border border-white/10 focus:border-violet-500 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1224] border border-white/10 text-white">
                  <SelectItem value="todo" className="hover:bg-white/5 text-slate-200 focus:bg-white/5 focus:text-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>To Do</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress" className="hover:bg-white/5 text-slate-200 focus:bg-white/5 focus:text-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>In Progress</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="review" className="hover:bg-white/5 text-slate-200 focus:bg-white/5 focus:text-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span>Review</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="done" className="hover:bg-white/5 text-slate-200 focus:bg-white/5 focus:text-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Done</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                <Flag className="h-4 w-4 text-purple-500" />
                <span>Priority</span>
              </label>
              <Select
                value={editedTask.priority}
                onValueChange={(value: IssuePriority) => setEditedTask({ ...editedTask, priority: value })}
              >
                <SelectTrigger className="bg-white/5 border border-white/10 focus:border-violet-500 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1224] border border-white/10 text-white">
                  {ISSUE_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value} className="hover:bg-white/5 text-slate-200 focus:bg-white/5 focus:text-white">
                      <div className="flex items-center space-x-2">
                        <span>{p.icon}</span>
                        <span>{p.label} Priority</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                <Tag className="h-4 w-4 text-violet-500" />
                <span>Issue Type</span>
              </label>
              <Select
                value={editedTask.issueType || "task"}
                onValueChange={(value: IssueType) => setEditedTask({ ...editedTask, issueType: value })}
              >
                <SelectTrigger className="bg-white/5 border border-white/10 focus:border-violet-500 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1224] border border-white/10 text-white">
                  {ISSUE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="hover:bg-white/5 text-slate-200 focus:bg-white/5 focus:text-white">
                      <div className="flex items-center space-x-2">
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Story Points</span>
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={editedTask.storyPoints ?? ""}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    storyPoints: e.target.value === "" ? null : Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                placeholder="—"
                className="bg-white/5 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all duration-200 text-white"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <span>Due Date</span>
              </label>
              <Input
                type="date"
                value={inputDueDate}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                className="bg-white/5 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all duration-200 text-white"
              />
            </div>
          </div>

          {/* Assignee Section */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-300 flex items-center space-x-2">
              <User className="h-4 w-4 text-indigo-500" />
              <span>Assignee</span>
            </label>
            <div className="flex items-center space-x-4 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <Avatar className="h-12 w-12 ring-2 ring-white/10">
                <AvatarImage src={editedTask.assignee?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                  {editedTask.assignee?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "NA"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-white">
                  {editedTask.assignee?.name || "Unassigned"}
                </p>
                <p className="text-sm text-slate-400">
                  {editedTask.assignee ? "Task assignee" : "No one assigned yet"}
                </p>
              </div>
              <Badge className={`${priorityConfig.color} text-sm font-bold px-3 py-1 shadow-sm`}>
                {editedTask.priority.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Labels */}
          {availableLabels.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                <Tag className="h-4 w-4 text-pink-500" />
                <span>Labels</span>
              </label>
              <div className="flex flex-wrap gap-2 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                {availableLabels.map((label) => {
                  const selected = (editedTask.labels ?? []).some((l) => l.id === label.id)
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label)}
                      aria-pressed={selected}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all duration-150 ${
                        selected
                          ? "border-transparent text-white shadow-sm"
                          : "border-white/15 text-slate-300 bg-white/5 hover:border-white/30"
                      }`}
                      style={selected ? { backgroundColor: label.color } : undefined}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: selected ? "rgba(255,255,255,0.8)" : label.color }}
                        aria-hidden="true"
                      />
                      {label.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <Separator className="bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Comments Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Comments ({editedTask.comments.length})
              </h3>
            </div>

            {/* Existing Comments (with replies) */}
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {(editedTask.comments || []).map((comment: any) => {
                const authorName = comment.user?.name || comment.author?.name || "User"
                const avatar = comment.user?.avatar || comment.author?.avatar || "/placeholder.svg"
                const createdAt = comment.created_at || comment.createdAt
                const replies = comment.replies || []
                return (
                  <div key={comment.id} className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                    <div className="flex space-x-3">
                      <Avatar className="h-10 w-10 ring-2 ring-white/10">
                        <AvatarImage src={avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                          {authorName.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-white">{authorName}</span>
                          <span className="text-xs text-slate-400 bg-white/10 px-2 py-1 rounded-full">
                            {createdAt ? new Date(createdAt).toLocaleString() : ""}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                        {/* Replies */}
                        {replies.length > 0 && (
                          <div className="mt-3 space-y-3 pl-6 border-l-2 border-white/[0.06]">
                            {replies.map((rep: any) => {
                              const repName = rep.user?.name || "User"
                              const repAvatar = rep.user?.avatar || "/placeholder.svg"
                              const repAt = rep.created_at || rep.createdAt
                              return (
                                <div key={rep.id} className="flex space-x-3">
                                  <CornerDownRight className="h-4 w-4 text-slate-600 mt-3" />
                                  <Avatar className="h-8 w-8 ring-2 ring-white/10">
                                    <AvatarImage src={repAvatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-xs">
                                      {repName.split(" ").map((n: string) => n[0]).join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-semibold text-white text-sm">{repName}</span>
                                      <span className="text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded-full">
                                        {repAt ? new Date(repAt).toLocaleString() : ""}
                                      </span>
                                    </div>
                                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{rep.content}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Reply box */}
                        <div className="mt-3 pl-6">
                          {replyOpenFor === comment.id ? (
                            <div className="flex items-start space-x-2">
                              <Textarea
                                placeholder="Write a reply..."
                                value={replyDrafts[comment.id] || ""}
                                onChange={(e) => setReplyDrafts((d) => ({ ...d, [comment.id]: e.target.value }))}
                                rows={2}
                                className="bg-white/5 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 text-white placeholder:text-slate-500"
                              />
                              <Button
                                onClick={() => {
                                  const content = (replyDrafts[comment.id] || "").trim()
                                  if (!content) return
                                  addReplyMutation.mutate({ parentId: comment.id, content })
                                  setReplyOpenFor(null)
                                }}
                                disabled={addReplyMutation.isPending || !(replyDrafts[comment.id] || "").trim()}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Reply
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyOpenFor(comment.id)}
                              className="text-violet-400 hover:bg-violet-500/10"
                            >
                              Reply
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Add New Comment */}
            <div className="bg-violet-500/5 p-4 rounded-xl border border-violet-500/20">
              <div className="flex space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-white/10">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                    CU
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Share your thoughts, updates, or questions..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="bg-white/5 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all duration-200 text-white placeholder:text-slate-500"
                  />
                  <Button 
                    onClick={() => {
                      const content = newComment.trim()
                      if (!content) return
                      addCommentMutation.mutate(content)
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Task Metadata */}
          <div className="bg-white/[0.03] p-6 rounded-xl border border-white/[0.06]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Created</p>
                  <p className="text-slate-400">{new Date(editedTask.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Tag className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{editedTask.issueKey ? "Issue Key" : "Task ID"}</p>
                  <p className="text-slate-400 font-mono">{editedTask.issueKey || `#${editedTask.id}`}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t border-white/[0.06]">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-transparent border border-white/15 text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
