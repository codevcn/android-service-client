import { clientAxios } from "../../configs/api-configs"
import type {
  TProjectInput,
  TProjectIdParam,
  TSendProjectInvitationsInput,
  TNotificationIdParam,
} from "./types/input-types"
import type { TProjectResponse, TProjectsResponse, TMessageResponse } from "./types/output-types"

export const apiGetProjects = async (): Promise<TProjectsResponse> => clientAxios.get("/projects")

export const apiGetProject = async ({ projectId }: TProjectIdParam): Promise<TProjectResponse> =>
  clientAxios.get(`/projects/${projectId}`)

export const apiCreateProject = async (payload: TProjectInput): Promise<TProjectResponse> =>
  clientAxios.post("/projects", payload)

export const apiUpdateProject = async (
  { projectId }: TProjectIdParam,
  payload: Partial<TProjectInput>,
): Promise<TProjectResponse> => clientAxios.put(`/projects/${projectId}`, payload)

export const apiDeleteProject = async ({ projectId }: TProjectIdParam): Promise<TMessageResponse> =>
  clientAxios.delete(`/projects/${projectId}`)

export const apiLeaveProject = async ({ projectId }: TProjectIdParam): Promise<TMessageResponse> =>
  clientAxios.delete(`/projects/${projectId}/leave`)

export const apiSendProjectInvitations = async ({
  projectId,
  userIds,
}: TSendProjectInvitationsInput): Promise<TMessageResponse> =>
  clientAxios.post(`/projects/${projectId}/invite`, { userIds })

export const apiAcceptProjectInvitation = async ({
  notificationId,
}: TNotificationIdParam): Promise<TMessageResponse> =>
  clientAxios.post(`/projects/invitations/${notificationId}/accept`)

export const apiRejectProjectInvitation = async ({
  notificationId,
}: TNotificationIdParam): Promise<TMessageResponse> =>
  clientAxios.post(`/projects/invitations/${notificationId}/reject`)

export const apiGetJoinedProjects = async (): Promise<TProjectsResponse> =>
  clientAxios.get("/projects/joined")
