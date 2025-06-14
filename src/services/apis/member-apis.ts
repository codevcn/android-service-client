import { clientAxios } from "../../configs/api-configs"
import type {
  TProjectMembersResponse,
  TProjectMemberResponse,
  TMsgApiResponse,
} from "./types/output-types"
import type {
  TGetProjectMembersParams,
  TGetProjectMemberParams,
  TAddMemberToATaskParams,
} from "./types/input-types"
import { EApiProjectMemberRoles } from "./types/output-enums"

export const apiGetProjectMembers = async ({
  projectId,
}: TGetProjectMembersParams): Promise<TProjectMembersResponse> =>
  clientAxios.get(`/members/projects/${projectId}`)

export const apiGetProjectMember = async ({
  projectId,
  userId,
}: TGetProjectMemberParams): Promise<TProjectMemberResponse> =>
  clientAxios.get(`/members/${userId}/projects/${projectId}`)

export const apiAddMemberToATask = async ({
  taskId,
  userId,
  projectId,
}: TAddMemberToATaskParams): Promise<TMsgApiResponse> =>
  clientAxios.post(`/members/add-member`, {}, { params: { taskId, userId, projectId } })

export const apiRemoveMemberFromATask = async (
  taskId: number,
  userId: number,
): Promise<TMsgApiResponse> =>
  clientAxios.delete(`/members/remove-member`, { params: { taskId, userId } })

export const apiChangeRole = async (
  projectId: number,
  userId: number,
  role: EApiProjectMemberRoles,
): Promise<TMsgApiResponse> =>
  clientAxios.put(`/members/change-role`, {}, { params: { projectId, userId, role } })

export const apiRemoveMemberFromProject = async (
  projectId: number,
  userId: number,
): Promise<TMsgApiResponse> =>
  clientAxios.delete(`/members/remove-project-member`, { params: { projectId, userId } })
