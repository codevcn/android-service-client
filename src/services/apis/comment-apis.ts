import { clientAxios } from "../../configs/api-configs"
import type { TCommentInput, TCommentParams, TCommentIdParam } from "./types/input-types"
import type { TCommentResponse, TCommentsResponse, TMessageResponse } from "./types/output-types"

export const apiGetCommentsByTask = async (taskId: number): Promise<TCommentsResponse> =>
  clientAxios.get(`/comments/task/${taskId}`)

export const apiCreateComment = async (
  { taskId, userId }: TCommentParams,
  payload: Partial<TCommentInput>,
): Promise<TCommentResponse> => clientAxios.post(`/comments/${taskId}/${userId}`, payload)

export const apiUpdateComment = async (
  { commentId }: TCommentIdParam,
  payload: Partial<TCommentInput>,
): Promise<TCommentResponse> => clientAxios.put(`/comments/${commentId}`, payload)

export const apiDeleteComment = async ({ commentId }: TCommentIdParam): Promise<TMessageResponse> =>
  clientAxios.delete(`/comments/${commentId}`)

export const apiMarkAsTaskResult = async ({
  commentId,
}: TCommentIdParam): Promise<TMessageResponse> =>
  clientAxios.put(`/comments/${commentId}/mark-as-task-result`)
