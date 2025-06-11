import {
  convertToApiTaskStatus,
  convertToGender,
  convertToUserRoles,
  convertToProjectRoles,
  convertToTaskStatus,
} from "../utils/api-converters/api-converters"
import type {
  TTaskFileData,
  TTaskData,
  TUploadedFileData,
  TTaskPreviewData,
  TTaskMemberData,
} from "./types"
import type { TSuccess, TTaskStatus } from "../utils/types"
import {
  apiCreateTask,
  apiDeleteTask,
  apiGetTask,
  apiGetTaskMembers,
  apiGetTasksByPhase,
  apiMarkTaskAsComplete,
  apiMoveTask,
  apiUpdateTask,
} from "./apis/task-apis"
import { apiUploadTaskFile, apiGetFileDetails, apiDownloadTaskFile } from "./apis/file-apis"
import type { TTaskInput } from "./apis/types/input-types"
import { apiAddMemberToATask, apiRemoveMemberFromATask } from "./apis/member-apis"
import { TDownloadFileResponse } from "./apis/types/output-types"
import {
  convertISOStringToLocalTime,
  convertLocalTimeToISOString,
  createImageUrlEndpoint,
} from "../utils/helpers"
import { commentService } from "./comment-service"
import { EGenders } from "../utils/enums"

class TaskService {
  async getTaskDetails(taskId: number): Promise<TTaskData> {
    const {
      data: { data: taskData },
    } = await apiGetTask({ id: taskId })
    if (!taskData) throw new Error("Task not found")
    const comments = await commentService.getCommentsByTask(taskId)
    const members = await this.getTaskMembers(taskData.id)
    return {
      comments,
      status: convertToTaskStatus(taskData.status),
      description: taskData.description,
      dueDate: taskData.dueDate ? convertLocalTimeToISOString(taskData.dueDate) : null,
      id: taskData.id,
      members,
      title: taskData.taskName,
    }
  }

  async getTasksByPhase(phaseId: number): Promise<TTaskPreviewData[]> {
    const {
      data: { data: tasks },
    } = await apiGetTasksByPhase(phaseId)
    if (!tasks) throw new Error("No tasks found")
    return await Promise.all(
      tasks.map(async (task): Promise<TTaskPreviewData> => {
        return {
          dueDate: task.dueDate ? convertLocalTimeToISOString(task.dueDate) : null,
          hasDescription: !!task.description,
          id: task.id,
          position: task.orderIndex,
          status: convertToTaskStatus(task.status),
          taskMembers: await this.getTaskMembers(task.id),
          title: task.taskName,
        }
      }),
    )
  }

  async getTaskMembers(taskId: number): Promise<TTaskMemberData[]> {
    const {
      data: { data: taskMembers },
    } = await apiGetTaskMembers(taskId)
    if (!taskMembers) throw new Error("No task members found")
    return taskMembers.map<TTaskMemberData>((member) => ({
      id: member.id,
      username: member.username,
      email: member.email,
      avatar: member.avatar || null,
      role: convertToUserRoles(member.role),
      emailVerified: member.emailVerified || false,
      projectRole: convertToProjectRoles(member.projectRole),
      fullName: member.fullname,
      bio: member.bio || null,
      birthday: member.birthday || null,
      gender: member.gender ? convertToGender(member.gender) : EGenders.OTHERS,
      socialLinks: member.socialLinks || null,
    }))
  }

  async uploadTaskFile(file: File, taskId: number, userId: number): Promise<TUploadedFileData> {
    const { data } = await apiUploadTaskFile({ file, taskId, userId })
    if (!data) throw new Error("File not uploaded")
    const fileData = data.data
    return {
      id: fileData.id,
      url: createImageUrlEndpoint(fileData.filePath),
    }
  }

  async downloadTaskFile(fileId: string): Promise<TDownloadFileResponse> {
    const res = await apiDownloadTaskFile(fileId)
    return res // res.data is a Blob
  }

  async getTaskFileDetails(fileId: TTaskFileData["id"]): Promise<TTaskFileData> {
    const {
      data: { data: fileData },
    } = await apiGetFileDetails(Number(fileId))
    if (!fileData) throw new Error("File not found")
    return {
      id: fileData.id.toString(),
      fileName: fileData.fileName,
      fileSize: fileData.fileSize.toString(),
      uploadedAt: convertLocalTimeToISOString(fileData.createdAt),
    }
  }

  async handleMarkTaskComplete(taskId: number, newStatus: TTaskStatus): Promise<void> {
    await apiMarkTaskAsComplete(taskId, convertToApiTaskStatus(newStatus))
  }

  async deleteTask(taskId: number, projectId: number): Promise<TSuccess> {
    await apiDeleteTask({ id: taskId }, projectId)
    return { success: true }
  }

  async updateTaskForPreview(
    taskId: number,
    taskData: Partial<TTaskInput>,
    projectId: number,
  ): Promise<TSuccess> {
    const { dueDate, ...rest } = taskData
    await apiUpdateTask(
      { id: taskId },
      {
        ...rest,
        dueDate: dueDate ? convertISOStringToLocalTime(dueDate) : undefined,
      },
      projectId,
    )
    return {
      success: true,
    }
  }

  async createNewTask(
    phaseId: number,
    taskName: string,
    orderIndex: number,
    projectId: number,
  ): Promise<TTaskPreviewData> {
    const {
      data: { data: task },
    } = await apiCreateTask(phaseId, taskName, orderIndex, projectId)
    if (!task) throw new Error("Task not created")
    return {
      id: task.id,
      title: task.taskName,
      hasDescription: !!task.description,
      taskMembers: await this.getTaskMembers(task.id),
      position: task.orderIndex,
      status: task.status as TTaskStatus,
      dueDate: task.dueDate ? convertLocalTimeToISOString(task.dueDate) : null,
    }
  }

  async updateTask(
    phaseId: number,
    taskId: number,
    taskData: Partial<TTaskData>,
    projectId: number,
  ): Promise<TSuccess> {
    const { dueDate } = taskData
    await apiUpdateTask(
      { id: taskId },
      {
        taskName: taskData.title,
        description: taskData.description || "",
        dueDate: dueDate ? convertISOStringToLocalTime(dueDate) : undefined,
        orderIndex: 0,
        phase: {
          id: phaseId,
        },
      },
      projectId,
    )
    return {
      success: true,
    }
  }

  async addMemberToATask(taskId: number, userId: number, projectId: number): Promise<TSuccess> {
    await apiAddMemberToATask({ taskId, userId, projectId })
    return { success: true }
  }

  async removeMemberFromATask(taskId: number, userId: number): Promise<TSuccess> {
    await apiRemoveMemberFromATask(taskId, userId)
    return { success: true }
  }

  async moveTask(
    taskId: number,
    phaseId: number,
    position: number,
    projectId: number,
  ): Promise<TSuccess> {
    await apiMoveTask(taskId, phaseId, position, projectId)
    return { success: true }
  }
}

export const taskService = new TaskService()
