import { clientAxios } from "../../configs/api-configs"
import type { TFileUploadInput, TFileIdParam } from "./types/input-types"
import type {
  TDownloadFileResponse,
  TFileResponse,
  TFilesResponse,
  TMessageResponse,
  TUserAvatarFileResponse,
} from "./types/output-types"

export const apiGetFilesByTask = async (taskId: number): Promise<TFilesResponse> =>
  clientAxios.get(`/files/task/${taskId}`)

export const apiUploadTaskFile = async ({
  file,
  taskId,
}: TFileUploadInput): Promise<TFileResponse> => {
  const formData = new FormData()
  formData.append("file", file)
  return clientAxios.post(`/files/upload/${taskId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const apiDeleteFile = async ({ fileId }: TFileIdParam): Promise<TMessageResponse> =>
  clientAxios.delete(`/files/${fileId}`)

export const apiGetFileDetails = async (fileId: number): Promise<TFileResponse> =>
  clientAxios.get(`/files/${fileId}`)

export const apiUploadUserAvatar = async (file: File): Promise<TUserAvatarFileResponse> => {
  const formData = new FormData()
  formData.append("file", file)
  return await clientAxios.post("/files/upload/user/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const apiDownloadTaskFile = async (fileId: string): Promise<TDownloadFileResponse> =>
  clientAxios.get(`/files/download/${fileId}`, { responseType: "blob" })
