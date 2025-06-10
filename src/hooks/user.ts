import { TProjectMemberData, TUserData } from "../services/types"
import { useAppSelector } from "./redux"

export const useUser = (): TUserData | null => {
   const { userData } = useAppSelector(({ user }) => user)
   return userData
}

export const useUserInProject = (): TProjectMemberData | null => {
   const { userInProject, userData } = useAppSelector(({ user }) => user)
   if (userInProject && userData) {
      return {
         ...userData,
         ...userInProject,
      }
   }
   return null
}
