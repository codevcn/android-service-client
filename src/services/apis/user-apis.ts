import { clientAxios } from "../../configs/api-configs"
import type { TUpdateUserProfileInput } from "./types/input-types"
import type { TUserResponse, TUsersResponse } from "./types/output-types"

export const apiGetCurrentUser = async (): Promise<TUserResponse> => clientAxios.get("/users/me")

export const apiUpdateUserProfile = async (
  userProfilePayload: Partial<TUpdateUserProfileInput>,
): Promise<TUserResponse> => clientAxios.put("/users/update/profile", userProfilePayload)

export const apiUpdateUserPassword = async (payload: {
  oldPassword: string
  newPassword: string
}): Promise<TUserResponse> => clientAxios.put("/users/update/password", payload)

export const apiSearchUsers = async (query: string): Promise<TUsersResponse> =>
  clientAxios.get(`/users/search?query=${query}`)

export const apiGetUser = async (userId: number): Promise<TUserResponse> =>
  clientAxios.get(`/users/${userId}`)
