// Jira-style project types — shapes match the API payloads (snake_case)

export interface Project {
  id: number
  team_id: number | null
  name: string
  key: string
  description?: string | null
  lead_user_id: number
  issue_counter: number
  boards_count?: number
  tasks_count?: number
  lead?: {
    id: number
    name: string
    email?: string
  }
  team?: {
    id: number
    name: string
  } | null
  labels?: Label[]
  created_at?: string
  updated_at?: string
}

export interface Label {
  id: number
  project_id: number
  name: string
  color: string
}

export type IssueType = "epic" | "story" | "task" | "bug" | "subtask"

export type StatusCategory = "todo" | "in_progress" | "done"

export interface Status {
  id: number
  project_id: number
  name: string
  category: StatusCategory
  position: number
  is_default: boolean
}

export interface Transition {
  id: number
  project_id: number
  from_status_id: number | null // null = from any status
  to_status_id: number
  name: string | null
  allowed_roles: string[] | null // null/empty = any editing member
  from_status?: Status
  to_status?: Status
}

export const STATUS_CATEGORIES: { value: StatusCategory; label: string; color: string }[] = [
  { value: "todo", label: "To Do", color: "#64748b" },
  { value: "in_progress", label: "In Progress", color: "#8b5cf6" },
  { value: "done", label: "Done", color: "#10b981" },
]

export type IssuePriority = "highest" | "high" | "medium" | "low" | "lowest"

export interface CreateProjectRequest {
  name: string
  key: string
  description?: string
  team_id?: number | null
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  lead_user_id?: number
}

export interface CreateLabelRequest {
  name: string
  color?: string
}

export const ISSUE_TYPES: { value: IssueType; label: string; icon: string }[] = [
  { value: "epic", label: "Epic", icon: "🟣" },
  { value: "story", label: "Story", icon: "📗" },
  { value: "task", label: "Task", icon: "🔷" },
  { value: "bug", label: "Bug", icon: "🐞" },
  { value: "subtask", label: "Subtask", icon: "↳" },
]

export const ISSUE_PRIORITIES: { value: IssuePriority; label: string; icon: string }[] = [
  { value: "highest", label: "Highest", icon: "🔺" },
  { value: "high", label: "High", icon: "🔥" },
  { value: "medium", label: "Medium", icon: "⚡" },
  { value: "low", label: "Low", icon: "🌱" },
  { value: "lowest", label: "Lowest", icon: "🔽" },
]
