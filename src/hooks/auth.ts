import { useEffect } from "react"
import { authService } from "../services/auth-service"
import { useAppDispatch, useAppSelector } from "./redux"
import { setAuthStatus } from "../redux/auth/auth-slice"
import { setUserData } from "../redux/user/user-slice"
import { EAuthStatus } from "../utils/enums"

type TUseAuth = {
   authStatus: EAuthStatus
}

export const useAuth = (): TUseAuth => {
   const { authStatus } = useAppSelector(({ auth }) => auth)
   const dispatch = useAppDispatch()

   useEffect(() => {
      authService
         .checkAuth()
         .then((res) => {
            dispatch(setAuthStatus(EAuthStatus.IS_AUTHENTICATED))
            dispatch(setUserData(res))
         })
         .catch(() => {
            dispatch(setAuthStatus(EAuthStatus.UNAUTHENTICATED))
         })
   }, [])

   return { authStatus }
}
