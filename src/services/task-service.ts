import {
  convertToApiTaskStatus,
  convertToTaskStatus,
  convertUndefinedFieldsToNull,
  convertProjectRoles,
} from "../utils/api-converters/api-converters"
import type {
  TTaskFileData,
  TTaskData,
  TUploadedFileData,
  TTaskPreviewData,
  TCommentData,
} from "./types"
import type { TSuccess, TTaskStatus } from "../utils/types"
import {
  apiCreateTask,
  apiDeleteTask,
  apiGetTask,
  apiMoveTask,
  apiUpdateTask,
} from "./apis/task-apis"
import { apiGetCommentsByTask } from "./apis/comment-apis"
import { apiGetUser } from "./apis/user-apis"
import { apiUploadTaskFile, apiGetFileDetails, apiDownloadTaskFile } from "./apis/file-apis"
import type { TTaskInput } from "./apis/types/input-types"
import { apiAddMemberToATask, apiRemoveMemberFromATask } from "./apis/member-apis"
import { convertUserApiData } from "../utils/api-converters/api-converters"
import { TDownloadFileResponse } from "./apis/types/output-types"
import { createImageUrlEndpoint } from "../utils/helpers"

class TaskService {
  async getTaskDetails(taskId: number): Promise<TTaskData> {
    const [taskResponse, commentsResponse] = await Promise.all([
      apiGetTask({ id: taskId }),
      apiGetCommentsByTask(taskId),
    ])
    const {
      data: { data: taskData },
    } = taskResponse
    const {
      data: { data: commentsData },
    } = commentsResponse
    if (!taskData) throw new Error("Task not found")
    const comments = await Promise.all(
      commentsData?.map(async (comment): Promise<TCommentData> => {
        const {
          data: { data: userData },
        } = await apiGetUser(comment.userId)
        if (!userData) throw new Error("User not found")
        return {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          user: {
            ...convertUserApiData(userData),
            projectRole: convertProjectRoles(comment.userRole),
          },
          isTaskResult: false,
        }
      }) || [],
    )
    const fetchedTaskMember = taskData.assignedToId ? await apiGetUser(taskData.assignedToId) : null
    const userAsMember = fetchedTaskMember
      ? convertUndefinedFieldsToNull(fetchedTaskMember.data.data)
      : null
    return {
      comments,
      status: convertToTaskStatus(taskData.status),
      description: taskData.description,
      dueDate: taskData.dueDate || null,
      id: taskData.id,
      members: userAsMember ? [{ ...userAsMember, fullName: userAsMember.fullname }] : [],
      title: taskData.taskName,
    }
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
      uploadedAt: fileData.createdAt,
    }
  }

  async handleMarkTaskComplete(
    taskId: number,
    newStatus: TTaskStatus,
    projectId: number,
  ): Promise<void> {
    await apiUpdateTask({ id: taskId }, { status: convertToApiTaskStatus(newStatus) }, projectId)
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
    await apiUpdateTask({ id: taskId }, taskData, projectId)
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
      taskMembers: task.assignedToId
        ? [convertUndefinedFieldsToNull(await apiGetUser(task.assignedToId))]
        : [],
      position: task.orderIndex,
      status: task.status as TTaskStatus,
      dueDate: task.dueDate || null,
    }
  }

  async updateTask(
    phaseId: number,
    taskId: number,
    taskData: Partial<TTaskData>,
    projectId: number,
  ): Promise<TSuccess> {
    await apiUpdateTask(
      { id: taskId },
      {
        taskName: taskData.title,
        description: taskData.description || "",
        dueDate: taskData.dueDate || undefined,
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
