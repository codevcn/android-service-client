import { clientAxios } from "../../configs/api-configs"
import type { TCommentInput, TCommentParams, TCommentIdParam } from "./types/input-types"
import type { TCommentResponse, TCommentsResponse, TMessageResponse } from "./types/output-types"

export const apiGetCommentsByTask = async (taskId: number): Promise<TCommentsResponse> =>
  clientAxios.get(`/comments/task/${taskId}`)

export const apiCreateComment = async (
  { taskId, userId }: TCommentParams,
  content: TCommentInput,
): Promise<TCommentResponse> => clientAxios.post(`/comments/${taskId}/${userId}`, { content })

export const apiUpdateComment = async (
  { commentId }: TCommentIdParam,
  content: TCommentInput,
): Promise<TCommentResponse> => clientAxios.put(`/comments/${commentId}`, { content })

export const apiDeleteComment = async ({ commentId }: TCommentIdParam): Promise<TMessageResponse> =>
  clientAxios.delete(`/comments/${commentId}`)

// đã bỏ
// export const apiMarkAsTaskResult = async (
//   { commentId }: TCommentIdParam,
//   { isTaskResult }: TMarkAsTaskResultInput,
// ): Promise<TCommentResponse> =>
//   clientAxios.put(`/comments/${commentId}/task-result`, { isTaskResult })
