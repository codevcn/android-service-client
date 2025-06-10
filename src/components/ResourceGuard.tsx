import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { EAuthStatus, EProjectRoles } from "../utils/enums"
import { RouteLoading } from "./Loadings"
import { useUser } from "../hooks/user"
import { toast } from "react-toastify"
import {
  checkAtLeastUserPermission,
  checkUserPermission,
  checkUserPermissions,
  type TAllPermissions,
} from "../configs/user-permissions"
import { useAuth } from "../hooks/auth"
import { generateRouteWithParams } from "../utils/helpers"

type TGuardProps = {
  children: React.JSX.Element
  fallback?: React.JSX.Element
  pathname: string
}

const AuthGuard = ({ children, fallback, pathname }: TGuardProps) => {
  const { authStatus } = useAuth()
  const user = useUser()
  const [isValid, setIsValid] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (authStatus === EAuthStatus.IS_AUTHENTICATED && user) {
      setIsValid(true)
    } else if (authStatus === EAuthStatus.UNAUTHENTICATED) {
      setIsValid(false)
      toast.error("Phiên đăng nhập hết hạn hoặc người dùng không có quyền truy cập tài nguyên.")
      navigate(generateRouteWithParams("/login", { redirect: pathname }))
    }
  }, [authStatus, user])

  if (isValid) {
    return children
  }

  return fallback || <></>
}

type TResourceGuardProps = {
  children: React.JSX.Element
  nonGuardRoutes: string[]
}

export const RouteGuard = ({ children, nonGuardRoutes }: TResourceGuardProps) => {
  const pathname = useLocation().pathname
  if (nonGuardRoutes.includes(pathname)) {
    return children
  }
  return (
    <AuthGuard pathname={pathname} fallback={<RouteLoading />}>
      {children}
    </AuthGuard>
  )
}

type TProjectRoleGuardProps = {
  children: React.JSX.Element
  permissions: TAllPermissions[]
  userProjectRole: EProjectRoles
  fallback?: React.JSX.Element
  checkAtLeast?: boolean
}

export const ProjectRoleGuard = ({
  children,
  permissions,
  userProjectRole,
  fallback,
  checkAtLeast,
}: TProjectRoleGuardProps) => {
  if (permissions.length > 1) {
    if (checkAtLeast && checkAtLeastUserPermission(userProjectRole, ...permissions)) {
      return children
    } else if (checkUserPermissions(userProjectRole, ...permissions)) {
      return children
    }
  } else if (checkUserPermission(userProjectRole, permissions[0])) {
    return children
  }
  return fallback || <></>
}
