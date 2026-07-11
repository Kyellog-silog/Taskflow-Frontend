import type { IssueType, Label } from "./project"

export interface Task {
    id: string
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    assigneeId?: string
    assignee?: User
    createdBy: string
    creator?: User
    boardId: string
    columnId: string
    dueDate?: string
    position: number
    completedAt?: string
    createdAt: string
    updatedAt: string
    comments?: Comment[]
    attachments?: Attachment[]
    activities?: Activity[]
    isLocked?: boolean
    canMoveTo?: string[]
    // Jira-style fields (Phase 1) — server-assigned, immutable: issueKey, projectId
    issueKey?: string
    issueType?: IssueType
    storyPoints?: number | null
    parentId?: string | null
    epicId?: string | null
    projectId?: string | null
    // Workflow status (Phase 2) — synced server-side with the column mapping
    statusId?: number | null
    labels?: Label[]
  }

  export type TaskStatus = "todo" | "in-progress" | "review" | "done"
  export type TaskPriority = "highest" | "high" | "medium" | "low" | "lowest"
  
  export interface Comment {
    id: string
    taskId: string
    userId: string
    user?: User
    content: string
    createdAt: string
    updatedAt: string
  }
  
  export interface Attachment {
    id: string
    taskId: string
    uploadedBy: string
    uploader?: User
    filename: string
    originalName: string
    filePath: string
    fileSize: number
    mimeType: string
    createdAt: string
  }
  
  export interface Activity {
    id: string
    taskId: string
    userId: string
    user?: User
    action: string
    description?: string
    oldValues?: Record<string, any>
    newValues?: Record<string, any>
    createdAt: string
  }
  
  export interface CreateTaskRequest {
    title: string
    description?: string
    boardId: string
    columnId: string
    assigneeId?: string
    priority?: TaskPriority
    dueDate?: string
    issueType?: IssueType
    storyPoints?: number | null
    parentId?: string
    epicId?: string
    labels?: number[]
  }

  export interface UpdateTaskRequest {
    title?: string
    description?: string
    assigneeId?: string
    priority?: TaskPriority
    dueDate?: string
    issueType?: IssueType
    storyPoints?: number | null
    parentId?: string | null
    epicId?: string | null
    labels?: number[]
  }
  
  export interface MoveTaskRequest {
    columnId: string
    position: number
  }
  
  interface User {
    id: string
    name: string
    email: string
    avatar?: string
  }
  