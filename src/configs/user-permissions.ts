import { EProjectRoles } from "../utils/enums"

const memberPermissions = ["pick-task", "mark-as-complete-task"] as const
const leaderPermissions = [
   ...memberPermissions,
   "add-remove-task-member",
   "CRUD-task",
   "CRUD-phase",
   "assign-task",
   "assign-due-date",
   "arrange-phase-task",
] as const
const adminPermissions = [
   ...leaderPermissions,
   "share-project",
   "CRUD-project",
   "assign-project-role",
   "add-remove-project-member",
] as const

type TMemberPermissions = (typeof memberPermissions)[number]
type TLeaderPermissions = (typeof memberPermissions)[number] | (typeof leaderPermissions)[number]
type TAdminPermissions = (typeof leaderPermissions)[number] | (typeof adminPermissions)[number]

export type TAllPermissions = TMemberPermissions | TLeaderPermissions | TAdminPermissions

/** Check if user has a single permission */
export const checkUserPermission = (
   userProjectRole: EProjectRoles,
   permission: TAllPermissions,
): boolean => {
   switch (userProjectRole) {
      case EProjectRoles.ADMIN:
         return adminPermissions.includes(permission as any)
      case EProjectRoles.LEADER:
         return leaderPermissions.includes(permission as any)
   }
   return memberPermissions.includes(permission as any)
}

/** Check if user has all given permissions */
export const checkUserPermissions = (
   userProjectRole: EProjectRoles,
   ...permissions: TAllPermissions[]
): boolean => {
   switch (userProjectRole) {
      case EProjectRoles.ADMIN:
         for (const permission of permissions) {
            if (!adminPermissions.includes(permission as any)) {
               return false
            }
         }
         return true
      case EProjectRoles.LEADER:
         for (const permission of permissions) {
            if (!leaderPermissions.includes(permission as any)) {
               return false
            }
         }
         return true
   }
   for (const permission of permissions) {
      if (!memberPermissions.includes(permission as any)) {
         return false
      }
   }
   return true
}

/** Check if user has at least one of given permissions */
export const checkAtLeastUserPermission = (
   userProjectRole: EProjectRoles,
   ...permissions: TAllPermissions[]
): boolean => {
   switch (userProjectRole) {
      case EProjectRoles.ADMIN:
         return permissions.some((permission) => adminPermissions.includes(permission as any))
      case EProjectRoles.LEADER:
         return permissions.some((permission) => leaderPermissions.includes(permission as any))
   }
   return permissions.some((permission) => memberPermissions.includes(permission as any))
}
