import { AxiosResponse } from "axios"
import type {
  EApiNotificationAction,
  EApiNotificationTypes,
  EApiProjectMemberRoles,
  EApiUserRoles,
  EApiGender,
} from "./output-enums"
import type { TApiTaskStatus } from "./sharings"

// Common types
export type TApiResponse<T = any> = {
  status: "success" | "error"
  data: T
  error: string | null
}

export type TLibResponse<T = any> = {
  data: T
}

// User types
export type TUser = {
  id: number
  username: string
  email: string
  fullname: string
  avatar?: string
  birthday?: string
  gender?: EApiGender
  socialLinks?: string
  bio?: string
  emailVerified?: boolean
  role: EApiUserRoles
}

export type TProjectMember = {
  id: number
  projectId: number
  role: EApiProjectMemberRoles
  userId: number
}

// Project types
export type TProject = {
  id: number
  projectName: string
  description: string
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED"
  startDate: string // ISO date string
  endDate?: string // ISO date string
  ownerId: number
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

// Phase types
export type TPhase = {
  id: number
  phaseName: string
  description: string
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
  startDate: string // ISO date string
  endDate?: string // ISO date string
  orderIndex: number
  projectId: number
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

// Task types
export type TTask = {
  id: number
  taskName: string
  description: string
  status: TApiTaskStatus
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  dueDate?: string // ISO date string
  allowSelfAssign: boolean
  orderIndex: number
  phaseId: number
  assignedToId?: number
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

// Comment types
export type TComment = {
  id: number
  content: string
  createdAt: string // ISO date string
  userId: number
  userRole: EApiProjectMemberRoles
  taskId: number
}

// File types
export type TTaskFile = {
  id: number
  fileName: string
  fileType: string
  fileSize: number
  filePath: string
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  userId: number
  taskId: number
}

// Notification types
export type TNotification = {
  notificationId: number
  userId: number
  message: string
  read: boolean
  createdAt: string
  type: EApiNotificationTypes
  action: EApiNotificationAction
  projectId: number | null
  senderId: number | null
}

// Auth response types
export type TJwtResponse = {
  token: string
  user: TUser
}

export type TGeneralSearch = {
  projects: {
    id: number
    title: string
  }[]
  phases: {
    id: number
    title: string
    project: {
      id: number
      title: string
    }
  }[]
  tasks: {
    id: number
    title: string
    project: {
      id: number
      title: string
    }
    phase: {
      id: number
      title: string
    }
  }[]
}

export type TTaskMember = TUser & {
  projectRole: EApiProjectMemberRoles
}

export type TUserAvatarFile = {
  filename: string
  filePath: string
  fileType: string
  fileSize: number
}

export type TDownloadFileResponse = AxiosResponse<Blob>

export type TStatistics = {
  ownedProjectsCount: number
  joinedProjectsCount: number
  totalProjectsCount: number
  totalTasksCount: number
  completedTasksCount: number
  pendingTasksCount: number
  projectMemberStats: {
    projectName: string
    memberCount: number
  }[]
  phaseStats: {
    projectId: number
    projectName: string
    phaseCount: number
  }[]
}

// API Response types
export type TGeneralSearchResponse = TApiResponse<TLibResponse<TGeneralSearch>>
export type TAuthResponse = TApiResponse<TLibResponse<TJwtResponse>>
export type TUserResponse = TApiResponse<TLibResponse<TUser>>
export type TUsersResponse = TApiResponse<TLibResponse<TUser[]>>
export type TProjectResponse = TApiResponse<TLibResponse<TProject>>
export type TProjectsResponse = TApiResponse<TLibResponse<TProject[]>>
export type TPhaseResponse = TApiResponse<TLibResponse<TPhase>>
export type TPhasesResponse = TApiResponse<TLibResponse<TPhase[]>>
export type TTaskResponse = TApiResponse<TLibResponse<TTask>>
export type TTasksResponse = TApiResponse<TLibResponse<TTask[]>>
export type TCommentResponse = TApiResponse<TLibResponse<TComment>>
export type TCommentsResponse = TApiResponse<TLibResponse<TComment[]>>
export type TFileResponse = TApiResponse<TLibResponse<TTaskFile>>
export type TFilesResponse = TApiResponse<TLibResponse<TTaskFile[]>>
export type TUserAvatarFileResponse = TApiResponse<TLibResponse<TUserAvatarFile>>
export type TUserAvatarFilesResponse = TApiResponse<TLibResponse<TUserAvatarFile[]>>
export type TNotificationResponse = TApiResponse<TLibResponse<TNotification>>
export type TNotificationsResponse = TApiResponse<TLibResponse<TNotification[]>>
export type TMessageResponse = TApiResponse<TLibResponse<string>>
export type TProjectMemberResponse = TApiResponse<TLibResponse<TProjectMember>>
export type TProjectMembersResponse = TApiResponse<TLibResponse<TProjectMember[]>>
export type TMsgApiResponse = TApiResponse<TLibResponse<TMessageResponse>>
export type TTaskMemberResponse = TApiResponse<TLibResponse<TTaskMember[]>>
export type TStatisticsResponse = TApiResponse<TLibResponse<TStatistics>>
