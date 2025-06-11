import type { TCommentData } from "./types"
import {
  apiCreateComment,
  apiDeleteComment,
  apiGetCommentsByTask,
  apiMarkAsTaskResult,
  apiUpdateComment,
} from "./apis/comment-apis"
import { apiGetUser } from "./apis/user-apis"
import type { TSuccess } from "../utils/types"
import { convertToProjectRoles, convertUserApiData } from "../utils/api-converters/api-converters"
import { convertLocalTimeToISOString } from "../utils/helpers"
import { userService } from "./user-service"

class CommentService {
  async getCommentsByTask(taskId: number): Promise<TCommentData[]> {
    const {
      data: { data: comments },
    } = await apiGetCommentsByTask(taskId)
    return await Promise.all(
      comments?.map(async (comment): Promise<TCommentData> => {
        const userData = await userService.getUser(comment.userId)
        if (!userData) throw new Error("User not found")
        return {
          id: comment.id,
          content: comment.content,
          createdAt: convertLocalTimeToISOString(comment.createdAt),
          user: {
            ...userData,
            projectRole: convertToProjectRoles(comment.userRole),
          },
          isTaskResult: comment.isTaskResult,
        }
      }) || [],
    )
  }

  async createNewComment(taskId: number, userId: number, content: string): Promise<TCommentData> {
    const {
      data: { data: comment },
    } = await apiCreateComment({ taskId, userId }, { content })
    if (!comment) throw new Error("Comment not created")
    const {
      data: { data: user },
    } = await apiGetUser(comment.userId)
    if (!user) throw new Error("User not found")
    return {
      id: comment.id,
      content: comment.content,
      createdAt: convertLocalTimeToISOString(comment.createdAt),
      user: {
        ...convertUserApiData(user),
        projectRole: convertToProjectRoles(comment.userRole),
      },
      isTaskResult: false,
    }
  }

  async updateComment(commentId: number, content: string): Promise<TSuccess> {
    const {
      data: { data: comment },
    } = await apiUpdateComment({ commentId }, { content })
    if (!comment) throw new Error("Comment not updated")
    return { success: true }
  }

  async deleteComment(commentId: number): Promise<TSuccess> {
    const {
      data: { data: comment },
    } = await apiDeleteComment({ commentId })
    if (!comment) throw new Error("Comment not deleted")
    return { success: true }
  }

  async markAsTaskResult(commentId: number): Promise<TSuccess> {
    await apiMarkAsTaskResult({ commentId })
    return { success: true }
  }
}

export const commentService = new CommentService()
