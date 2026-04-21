"use client"

import type React from "react"
import { useDroppable } from "@dnd-kit/core"
import { Plus, AlertTriangle, Users, Sparkles, Target } from 'lucide-react'
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

interface Column {
  id: string
  title: string
  tasks: any[]
  maxTasks?: number
  acceptsFrom?: string[]
  color?: string
}

interface DroppableColumnProps {
  column: Column
  children: React.ReactNode
  dragConstraints?: {
    allowedColumns: string[]
    blockedColumns: string[]
    reason?: string
  }
  userRole?: "admin" | "member"
  canCreate?: boolean
  onCreateTask: () => void
}

export function DroppableColumn({
  column,
  children,
  dragConstraints = { allowedColumns: [], blockedColumns: [] },
  userRole = "member",
  canCreate = true,
  onCreateTask,
}: DroppableColumnProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    }
  })

  const isBlocked = dragConstraints.blockedColumns.includes(column.id)
  const isAllowed = dragConstraints.allowedColumns.length === 0 || dragConstraints.allowedColumns.includes(column.id)
  const isNearCapacity = column.maxTasks && column.tasks.length >= column.maxTasks * 0.8
  const isAtCapacity = !!(column.maxTasks && column.tasks.length >= column.maxTasks)

  const getColumnConfig = () => {
    const configs = {
      'todo': {
        headerGradient: 'from-violet-500/10 to-blue-500/5',
        topBorderColor: 'border-t-violet-500/50',
        icon: '📋',
        accentColor: 'text-violet-400',
        badgeBg: 'bg-violet-500/15 text-violet-300',
        addTaskHover: 'hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300',
        dropAllowedBg: 'bg-violet-500/10',
        dropAllowedBorder: 'border-violet-500/40 text-violet-300',
      },
      'in-progress': {
        headerGradient: 'from-amber-500/10 to-orange-500/5',
        topBorderColor: 'border-t-amber-500/50',
        icon: '⚡',
        accentColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/15 text-amber-300',
        addTaskHover: 'hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-300',
        dropAllowedBg: 'bg-amber-500/10',
        dropAllowedBorder: 'border-amber-500/40 text-amber-300',
      },
      'review': {
        headerGradient: 'from-purple-500/10 to-pink-500/5',
        topBorderColor: 'border-t-purple-500/50',
        icon: '👀',
        accentColor: 'text-purple-400',
        badgeBg: 'bg-purple-500/15 text-purple-300',
        addTaskHover: 'hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300',
        dropAllowedBg: 'bg-purple-500/10',
        dropAllowedBorder: 'border-purple-500/40 text-purple-300',
      },
      'done': {
        headerGradient: 'from-emerald-500/10 to-teal-500/5',
        topBorderColor: 'border-t-emerald-500/50',
        icon: '✅',
        accentColor: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/15 text-emerald-300',
        addTaskHover: 'hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300',
        dropAllowedBg: 'bg-emerald-500/10',
        dropAllowedBorder: 'border-emerald-500/40 text-emerald-300',
      }
    }

    // Custom color fallback maps to matching config
    if (column.color) {
      const colorMap: { [key: string]: keyof typeof configs } = {
        'blue-500': 'todo',
        'yellow-500': 'in-progress',
        'purple-500': 'review',
        'green-500': 'done',
      }
      const mappedKey = colorMap[column.color]
      if (mappedKey) return configs[mappedKey]
    }

    return configs[column.id as keyof typeof configs] || configs['todo']
  }

  const config = getColumnConfig()

  const getColumnStyle = () => {
    let baseStyle = `bg-[#0a0f1e] rounded-xl border-t-2 border border-white/[0.06] ${config.topBorderColor} transition-all duration-300`

    if (isOver && isAllowed && !isBlocked) {
      baseStyle += " ring-1 ring-violet-500/40 border-violet-500/20"
    } else if (isOver && isBlocked) {
      baseStyle += " ring-1 ring-red-500/40 border-red-500/20"
    } else if (isBlocked && dragConstraints.allowedColumns.length > 0) {
      baseStyle += " opacity-50"
    }

    if (active) {
      baseStyle += " transition-transform duration-200"
    }

    return baseStyle
  }

  const getCapacityColor = () => {
    if (isAtCapacity) return "bg-red-500/15 text-red-400"
    if (isNearCapacity) return "bg-amber-500/15 text-amber-400"
    return config.badgeBg
  }

  return (
    <div className={getColumnStyle()}>
      {/* Header */}
      <div className={`p-4 rounded-t-xl bg-gradient-to-br ${config.headerGradient}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="text-xl">{config.icon}</div>
            <h2 className={`font-semibold text-sm text-white`}>{column.title}</h2>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={`${getCapacityColor()} font-semibold text-xs px-2 py-0.5 border-0`}>
              {column.tasks.length}
              {column.maxTasks && `/${column.maxTasks}`}
            </Badge>
            {isAtCapacity && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
          </div>
        </div>

        {/* Column constraints info */}
        <div className="flex flex-wrap gap-1.5 text-xs text-slate-400">
          {column.acceptsFrom && (
            <div className="flex items-center space-x-1 bg-white/10 px-2 py-0.5 rounded-full">
              <Users className="h-3 w-3" />
              <span>From: {column.acceptsFrom.join(", ")}</span>
            </div>
          )}
          {column.maxTasks && (
            <div className="flex items-center space-x-1 bg-white/10 px-2 py-0.5 rounded-full">
              <Target className="h-3 w-3" />
              <span>Max: {column.maxTasks}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div
        ref={setNodeRef}
        className={`p-3 min-h-[500px] space-y-3 rounded-b-xl transition-colors duration-200 ${
          isOver && isAllowed && !isBlocked ? config.dropAllowedBg : ""
        } ${isOver && isBlocked ? "bg-red-500/5" : ""}`}
      >
        {/* Drag constraints warning */}
        {isOver && isBlocked && dragConstraints?.reason && (
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center space-x-2 text-red-400 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-medium">{dragConstraints.reason}</span>
            </div>
          </div>
        )}

        {children}

        {/* Drop zone indicator */}
        {isOver && (
          <div
            className={`p-5 border border-dashed rounded-xl text-center transition-all duration-200 ${
              isAllowed && !isBlocked
                ? `${config.dropAllowedBorder} ${config.dropAllowedBg}`
                : "border-red-500/40 bg-red-500/10 text-red-400"
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              {isAllowed && !isBlocked ? (
                <>
                  <Sparkles className={`h-6 w-6 ${config.accentColor}`} />
                  <span className="text-sm font-medium">Drop task here</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                  <span className="text-sm font-medium">{dragConstraints.reason || "Cannot drop here"}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Add Task Button */}
        <Button
          variant="ghost"
          className={`w-full justify-center text-slate-500 border border-dashed border-white/[0.08] rounded-xl py-5 transition-all duration-200 ${config.addTaskHover} ${
            isAtCapacity
              ? "opacity-40 cursor-not-allowed"
              : "hover:shadow-none"
          }`}
          onClick={onCreateTask}
          disabled={!!isAtCapacity || !canCreate}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">{isAtCapacity ? "Column Full" : (!canCreate ? "View-only" : "Add a task")}</span>
        </Button>
      </div>
    </div>
  )
}
