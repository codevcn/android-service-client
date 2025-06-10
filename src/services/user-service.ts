import { convertUserApiData, convertToApiGender } from "../utils/api-converters/api-converters"
import { EGenders } from "../utils/enums"
import type { TSuccess } from "../utils/types"
import { apiUploadUserAvatar } from "./apis/file-apis"
import { apiSearchUsers, apiUpdateUserPassword, apiUpdateUserProfile } from "./apis/user-apis"
import type { TSearchUserData, TUploadImageData, TUserProfileData } from "./types"
import { createImageUrlEndpoint } from "../utils/helpers"

class UserService {
  async searchUsers(keyword: string): Promise<TSearchUserData[]> {
    const { data } = await apiSearchUsers(keyword)
    const users = data?.data
    return users?.map((user) => convertUserApiData(user)) || []
  }

  async updateProfile(profilePayload: Partial<TUserProfileData>): Promise<TSuccess> {
    await apiUpdateUserProfile({
      avatar: profilePayload.avatar || undefined,
      fullname: profilePayload.fullName || undefined,
      birthday: profilePayload.birthday || undefined,
      bio: profilePayload.bio || undefined,
      socialLinks: profilePayload.socialLinks || undefined,
      gender: convertToApiGender(profilePayload.gender || EGenders.OTHERS),
    })
    return { success: true }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<TSuccess> {
    await apiUpdateUserPassword({
      oldPassword: currentPassword,
      newPassword,
    })
    return { success: true }
  }

  async uploadAvatar(image: File): Promise<TUploadImageData> {
    const { data } = await apiUploadUserAvatar(image)
    if (!data) throw new Error("File not uploaded")
    const fileData = data.data
    return {
      imageURL: createImageUrlEndpoint(fileData.filePath),
    }
  }
}

export const userService = new UserService()
