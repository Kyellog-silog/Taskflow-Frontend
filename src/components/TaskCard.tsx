"use client"
import * as React from "react"
import { forwardRef } from "react"
import { MoreHorizontal, Calendar, MessageSquare, AlertCircle, Clock, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: "low" | "medium" | "high"
  assignee?: {
    id: string
    name: string
    avatar: string
  }
  dueDate?: string
  comments: any[]
  createdAt: string
  canMoveTo?: string[]
}

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  onEdit?: () => void
  onDelete?: () => void
  showConstraints?: boolean
  constraintReason?: string
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, isDragging = false, onEdit, onDelete, showConstraints = false, constraintReason, ...props }, ref) => {
    const getPriorityConfig = (priority: string) => {
      switch (priority) {
        case "high":
          return {
            badge: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
            icon: "🔥",
            leftBorder: "border-l-red-500",
          }
        case "medium":
          return {
            badge: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
            icon: "⚡",
            leftBorder: "border-l-amber-500",
          }
        case "low":
          return {
            badge: "bg-gradient-to-r from-emerald-500 to-green-500 text-white",
            icon: "🌱",
            leftBorder: "border-l-emerald-500",
          }
        default:
          return {
            badge: "bg-gradient-to-r from-slate-500 to-slate-600 text-white",
            icon: "📋",
            leftBorder: "border-l-slate-500",
          }
      }
    }

    const priorityConfig = getPriorityConfig(task.priority)

    const getCardStyle = () => {
      let style = `group bg-[#0d1224] hover:bg-[#111827] border border-white/[0.06] hover:border-white/[0.10] border-l-2 ${priorityConfig.leftBorder} rounded-xl transition-all duration-200 relative overflow-hidden`

      if (isDragging) {
        style += " shadow-2xl rotate-2 scale-105 ring-1 ring-violet-500/40"
      }

      if (showConstraints) {
        style += " ring-1 ring-amber-500/30"
      }

      return style
    }

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

    return (
      <Card ref={ref} className={getCardStyle()} {...props}>
        <CardContent className="p-4 space-y-3">
          {/* Header with title and actions */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2 flex-1 min-w-0">
              <div className="text-base leading-none mt-0.5">{priorityConfig.icon}</div>
              <h3 className="font-semibold text-sm text-white line-clamp-2 flex-1 group-hover:text-violet-300 transition-colors">
                {task.title}
              </h3>
            </div>

            {/* 3-Dot Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Task options"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-[#0d1224] border border-white/10 shadow-xl rounded-xl">
                <DropdownMenuItem
                  className="text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer rounded-lg mx-1 my-1 focus:bg-white/5 focus:text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.()
                  }}
                >
                  <Edit className="h-4 w-4 mr-2 text-violet-400" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/[0.06]" />
                <DropdownMenuItem
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer rounded-lg mx-1 my-1 focus:bg-red-500/10 focus:text-red-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.()
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Constraint warning */}
          {showConstraints && constraintReason && (
            <div className="flex items-center space-x-2 p-2 bg-amber-500/10 rounded-lg text-xs text-amber-400 border border-amber-500/20">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium">{constraintReason}</span>
            </div>
          )}

          {/* Priority badge + metadata */}
          <div className="flex items-center justify-between">
            <Badge className={`${priorityConfig.badge} text-xs font-semibold px-2 py-0.5 border-0`}>
              {task.priority.toUpperCase()}
            </Badge>

            <div className="flex items-center space-x-3 text-xs text-slate-500">
              {task.dueDate && (
                <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-400 font-medium' : ''}`}>
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  {isOverdue && <Clock className="h-3 w-3" />}
                </div>
              )}
              {task.comments.length > 0 && (
                <div className="flex items-center space-x-1 text-violet-400">
                  <MessageSquare className="h-3 w-3" />
                  <span className="font-medium">{task.comments.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6 ring-1 ring-white/10">
                <AvatarImage src={task.assignee?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  {task.assignee?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "NA"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-slate-300">
                {task.assignee?.name || "Unassigned"}
              </span>
            </div>

            {/* Task ID */}
            <span className="text-xs text-slate-600 font-mono">#{task.id.slice(-4)}</span>
          </div>

          {/* Movement restrictions indicator */}
          {task.canMoveTo && task.canMoveTo.length > 0 && (
            <div className="text-xs text-violet-400 bg-violet-500/10 p-2 rounded-lg border border-violet-500/20">
              <span className="font-medium">Restricted:</span> Can only move to {task.canMoveTo.join(", ")}
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
)

TaskCard.displayName = "TaskCard"
