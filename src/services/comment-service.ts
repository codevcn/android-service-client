import type { TCommentData } from "./types"
import { apiCreateComment, apiDeleteComment, apiUpdateComment } from "./apis/comment-apis"
import { apiGetUser } from "./apis/user-apis"
import type { TSuccess } from "../utils/types"
import { convertProjectRoles, convertUserApiData } from "../utils/api-converters/api-converters"

class CommentService {
  async createNewComment(taskId: number, userId: number, content: string): Promise<TCommentData> {
    const {
      data: { data: comment },
    } = await apiCreateComment({ taskId, userId }, content)
    if (!comment) throw new Error("Comment not created")
    const {
      data: { data: user },
    } = await apiGetUser(comment.userId)
    if (!user) throw new Error("User not found")
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        ...convertUserApiData(user),
        projectRole: convertProjectRoles(comment.userRole),
      },
      isTaskResult: false,
    }
  }

  async updateComment(commentId: number, content: string): Promise<TSuccess> {
    const {
      data: { data: comment },
    } = await apiUpdateComment({ commentId }, content)
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

  // đã bỏ
  // async markAsTaskResult(commentId: number, isTaskResult: boolean): Promise<TSuccess> {
  //   const {
  //     data: { data: comment },
  //   } = await apiMarkAsTaskResult({ commentId }, { isTaskResult })
  //   if (!comment) throw new Error("Comment not marked as task result")
  //   return { success: true }
  // }
}

export const commentService = new CommentService()
