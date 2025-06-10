import type { EApiGender } from "./output-enums"
import type { TApiTaskStatus } from "./sharings"

// Auth types
export type TSignupInput = {
  username: string
  email: string
  password: string
  fullname: string
}

export type TLoginInput = {
  usernameOrEmail: string
  password: string
}

// Project types
export type TProjectInput = {
  projectName: string
  description: string
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED"
  startDate: string // ISO date string
  endDate?: string // ISO date string
}

// Phase types
export type TPhaseInput = {
  phaseName: string
  description: string
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
  startDate: string // ISO date string
  endDate?: string // ISO date string
  orderIndex: number
  project: {
    id: number
  }
}

// Task types
export type TTaskInput = {
  taskName: string
  description: string
  status: TApiTaskStatus
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  dueDate?: string // ISO date string
  allowSelfAssign: boolean
  orderIndex: number
  phase: {
    id: number
  }
  assignedTo?: {
    id: number
  }
}

// Comment types
export type TCommentInput = string // Content of the comment

// File types
export type TFileUploadInput = {
  file: File
  taskId: number
  userId: number
}

// Path parameters types
export type TProjectIdParam = {
  projectId: number
}

export type TPhaseIdParam = number

export type TTaskIdParam = {
  id: number
}

export type TCommentParams = {
  taskId: number
  userId: number
}

export type TCommentIdParam = {
  commentId: number
}

export type TFileIdParam = {
  fileId: number
}

export type TNotificationIdParam = {
  notificationId: number
}

export type TGetProjectMembersParams = {
  projectId: number
}

export type TGetProjectMemberParams = {
  projectId: number
  userId: number
}

export type TUpdateUserProfileInput = {
  fullname: string
  avatar: string
  birthday: string
  gender: EApiGender
  bio: string
  socialLinks: string
}

export type TMarkAsTaskResultInput = {
  isTaskResult: boolean
}

export type TAddMemberToATaskParams = {
  taskId: number
  userId: number
  projectId: number
}

export type TSendProjectInvitationsInput = {
  projectId: number
  userIds: number[]
}
