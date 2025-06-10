import { EApiProjectMemberRoles, EApiGender } from "../../services/apis/types/output-enums"
import type { TTaskStatus } from "../types"
import type { TApiTaskStatus } from "../../services/apis/types/sharings"
import { EGenders, EProjectRoles, EUserRoles } from "../../utils/enums"
import type { TUserData } from "../../services/types"
import type { TUser } from "../../services/apis/types/output-types"

export const convertUndefinedFieldsToNull = <T extends Record<string | number, any>>(
  object: T,
): any => {
  const result: any = {}
  for (const key in object) {
    if (!object[key]) {
      result[key] = null
    } else {
      result[key] = object[key]
    }
  }
  return result
}

export const convertProjectRoles = (projectRole: EApiProjectMemberRoles): EProjectRoles => {
  switch (projectRole) {
    case EApiProjectMemberRoles.Admin:
      return EProjectRoles.ADMIN
    case EApiProjectMemberRoles.Leader:
      return EProjectRoles.LEADER
    default:
      return EProjectRoles.MEMBER
  }
}

export const convertToTaskStatus = (taskStatus: TApiTaskStatus): TTaskStatus => {
  switch (taskStatus) {
    case "IN_PROGRESS":
      return "uncomplete"
    case "DONE":
      return "complete"
  }
}

export const convertToApiTaskStatus = (taskStatus: TTaskStatus): TApiTaskStatus => {
  switch (taskStatus) {
    case "uncomplete":
      return "IN_PROGRESS"
    case "complete":
      return "DONE"
  }
}

export const convertToGender = (gender: EApiGender): EGenders => {
  switch (gender) {
    case EApiGender.Male:
      return EGenders.MALE
    case EApiGender.Female:
      return EGenders.FEMALE
    default:
      return EGenders.OTHERS
  }
}

export const convertUserApiData = (apiData: TUser): TUserData => ({
  id: apiData.id,
  socialLinks: apiData.socialLinks || null,
  email: apiData.email,
  fullName: apiData.fullname,
  avatar: apiData.avatar || null,
  role: EUserRoles.USER,
  birthday: apiData.birthday || null,
  gender: convertToGender(apiData.gender || EApiGender.Other),
  bio: apiData.bio || null,
  emailVerified: apiData.emailVerified || false,
})

export const convertToApiGender = (gender: EGenders): EApiGender => {
  switch (gender) {
    case EGenders.MALE:
      return EApiGender.Male
    case EGenders.FEMALE:
      return EApiGender.Female
    default:
      return EApiGender.Other
  }
}
