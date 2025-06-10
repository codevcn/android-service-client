// đã sửa xong file này

import { convertProjectRoles } from "../utils/api-converters/api-converters"
import type {
  TProjectData,
  TProjectMemberData,
  TProjectPreviewData,
  TUserInProjectData,
} from "./types"
import type { TSuccess } from "../utils/types"
import { apiGetProjectMember, apiGetProjectMembers } from "./apis/member-apis"
import {
  apiCreateProject,
  apiAcceptProjectInvitation,
  apiGetProject,
  apiGetProjects,
  apiLeaveProject,
  apiRejectProjectInvitation,
  apiSendProjectInvitations,
  apiUpdateProject,
  apiGetJoinedProjects,
  apiDeleteProject,
  apiRemoveMemberFromProject,
} from "./apis/project-apis"
import { projectBackgrounds, staticStarredValue } from "../lib/project-static-data"
import { apiGetUser } from "./apis/user-apis"
import { convertUserApiData } from "../utils/api-converters/api-converters"

class ProjectService {
  async getUserInfoInProject(userId: number, projectId: number): Promise<TUserInProjectData> {
    const { data } = await apiGetProjectMember({ userId, projectId })
    if (!data) {
      throw new Error("User not found in project")
    }
    const userInfoInProject: TUserInProjectData = {
      projectRole: convertProjectRoles(data.data.role),
    }
    return userInfoInProject
  }

  async getProjects(): Promise<TProjectPreviewData[]> {
    const { data } = await apiGetProjects()
    if (!data) {
      throw new Error("Projects not found")
    }
    return data.data.map((project) => ({
      title: project.projectName,
      id: project.id,
      background: projectBackgrounds[0],
      starred: staticStarredValue,
      createdAt: project.createdAt,
    }))
  }

  async getProjectData(projectId: number): Promise<TProjectData> {
    const { data } = await apiGetProject({ projectId })
    if (!data) {
      throw new Error("Project not found")
    }
    const members = await this.getProjectMembers(projectId)
    const projectData = data.data
    return {
      title: projectData.projectName,
      id: projectId,
      members,
      shareLink: "http://localhost:5173/projects/1",
      description: projectData.description,
      background: projectBackgrounds[0],
      starred: staticStarredValue,
      ownerId: projectData.ownerId,
    }
  }

  async leaveProject(projectId: number): Promise<void> {
    await apiLeaveProject({ projectId })
  }

  async getProjectMembers(projectId: number): Promise<TProjectMemberData[]> {
    const { data } = await apiGetProjectMembers({ projectId })
    if (!data) {
      throw new Error("Project members not found")
    }
    const members = data.data
    return Promise.all(
      members.map(async (member) => {
        const {
          data: { data: user },
        } = await apiGetUser(member.userId)
        if (!user) {
          throw new Error("User not found")
        }
        return {
          ...convertUserApiData(user),
          projectRole: convertProjectRoles(member.role),
        }
      }),
    )
  }

  async sendProjectInvitations(projectId: number, ...userIds: number[]): Promise<void> {
    await apiSendProjectInvitations({ projectId, userIds })
  }

  // đã bỏ
  // async joinProject(projectId: number): Promise<void> {
  //   await perfomDelay(1000)
  // }

  // đã bỏ
  // async createNewShareLink(projectId: number): Promise<TCreateNewShareLinkData> {
  //   await perfomDelay(1000)
  //   const data: TCreateNewShareLinkData = {
  //     newshareLink: "https://codevcn.net",
  //   }
  //   return data
  // }

  // đã bỏ
  // async deleteShareLink(projectId: number): Promise<void> {
  //   await perfomDelay(1000)
  // }

  async createNewProject(projectTitle: string): Promise<TSuccess> {
    await apiCreateProject({
      projectName: projectTitle,
      description: "",
      startDate: new Date().toISOString(),
      status: "ACTIVE",
      endDate: new Date().toISOString(),
    })
    return { success: true }
  }

  async updateProject(projectId: number, projectData: Partial<TProjectData>): Promise<TSuccess> {
    await apiUpdateProject(
      { projectId },
      {
        projectName: projectData.title,
        description: projectData.description || "",
      },
    )
    return { success: true }
  }

  // đã bỏ
  // async getProjectInvitations(projectId: number): Promise<TProjectInvitationData[]> {
  //   await perfomDelay(1000)
  //   return projectInvitations
  // }

  // đã bỏ
  // async getProjectRequests(projectId: number): Promise<TProjectRequestData[]> {
  //   await perfomDelay(1000)
  //   return projectRequests
  // }

  // đã bỏ
  // async acceptDeclineRequest(requestId: number, isAccept: boolean): Promise<TSuccess> {
  //   await perfomDelay(1000)
  //   return { success: true }
  // }

  // đã bỏ
  // async updateProjectBackground(
  //   projectId: number,
  //   backgroundImage: Blob,
  // ): Promise<TUploadImageData> {
  //   await perfomDelay(1000)
  //   return {
  //     imageURL:
  //       "https://trello-backgrounds.s3.amazonaws.com/SharedBackground/2560x1703/6f971f0ef48c1a5f2cde86f2d3a9ab56/photo-1736297150541-89378f055b96.webp",
  //   }
  // }

  async acceptProjectInvitation(notificationId: number): Promise<void> {
    await apiAcceptProjectInvitation({ notificationId })
  }

  async rejectProjectInvitation(notificationId: number): Promise<void> {
    await apiRejectProjectInvitation({ notificationId })
  }

  async getJoinedProjects(): Promise<TProjectPreviewData[]> {
    const { data } = await apiGetJoinedProjects()
    if (!data) {
      throw new Error("Projects not found")
    }
    return data.data.map((project) => ({
      title: project.projectName,
      id: project.id,
      background: projectBackgrounds[0],
      starred: staticStarredValue,
      createdAt: project.createdAt,
    }))
  }

  async deleteProject(projectId: number): Promise<void> {
    await apiDeleteProject({ projectId })
  }

  async removeMemberFromProject(projectId: number, userId: number): Promise<void> {
    await apiRemoveMemberFromProject(projectId, userId)
  }
}

export const projectService = new ProjectService()
