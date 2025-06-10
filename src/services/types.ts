import type {
  EGenders,
  EProjectInvitationStatus,
  EProjectRequestStatus,
  EProjectRoles,
  EUserRoles,
} from "../utils/enums"
import type { TTaskStatus } from "../utils/types"
import type { EApiNotificationAction, EApiNotificationTypes } from "./apis/types/output-enums"

export type TUserProfileData = {
  fullName: string
  bio: string | null
  birthday: string | null
  gender: EGenders
  socialLinks: string | null
  avatar: string | null
}

export type TUserData = TUserProfileData & {
  id: number
  email: string
  role: EUserRoles
  emailVerified: boolean
}

export type TLoginPayload = {
  email: string
  password: string
}

export type TRegisterPayload = {
  fullname: string
  email: string
  password: string
  reTypePassword: string
}

export type TUserInProjectData = {
  projectRole: EProjectRoles
}

export type TProjectMemberData = TUserData & TUserInProjectData

export type TProjectData = {
  id: number
  title: string
  members: TProjectMemberData[]
  shareLink: string | null
  description: string | null
  background: string | null
  starred: boolean
  ownerId: number
}

export type TTaskMemberData = TUserData & TUserInProjectData

export type TCommentData = {
  id: number
  content: string
  user: TTaskMemberData
  createdAt: string
  isTaskResult: boolean
}

export type TTaskData = {
  id: number
  title: string
  description: string | null
  members: TTaskMemberData[] | null
  comments: TCommentData[] | null
  dueDate: string | null
  status: TTaskStatus
}

export type TTaskPreviewData = {
  id: number
  title: string
  hasDescription: boolean
  taskMembers: TTaskMemberData[] | null
  position: number
  status: TTaskStatus
  dueDate: string | null
}

export type TPhaseData = {
  id: number
  title: string
  taskPreviews: TTaskPreviewData[] | null
  position: number
  description: string | null
}

export type TTaskFileData = {
  id: string
  fileName: string
  fileSize: string
  uploadedAt: string
}

export type TUploadedFileData = {
  id: number
  url: string
}

export type TCreateNewShareLinkData = {
  newshareLink: string
}

export type TProjectPreviewData = {
  id: number
  title: string
  background: string | null
  starred: boolean
  createdAt: string
}

export type TSearchUserData = {
  id: number
  fullName: string
  email: string
  avatar: string | null
  role: EUserRoles
}

export type TUploadImageData = {
  imageURL: string
}

export type TGoogleOAuthData = {
  clientId: string
  redirectURI: string
  scope: string
}

export type TGeneralNotificationData = {
  id: number
  description: string
  timestamp: string
  seen: boolean
  type: EApiNotificationTypes
  action: EApiNotificationAction
  projectId: number | null
  senderId: number | null
}

export type TNotificationData = TGeneralNotificationData

export type TFetchNotificationsData = {
  notifications: TNotificationData[]
}

export type TProjectInvitationData = {
  id: number
  projectId: number
  sender: {
    id: number
  }
  receiver: {
    id: number
    fullName: string
    email: string
    avatar: string
  }
  status: EProjectInvitationStatus
  sendAt: string
}

export type TProjectRequestData = {
  id: number
  projectId: number
  sender: {
    id: number
    fullName: string
    email: string
    avatar: string
  }
  status: EProjectRequestStatus
  sendAt: string
}

export type TCountUnreadNotificationsData = {
  total: number
}

export type TGeneralSearchData = {
  projects: {
    id: number
    title: string
    background: string | null
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

export type TStatisticsData = {
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
