import { useEffect, useRef } from "react"
import googleLogo from "../../assets/google-logo.svg"
import { useAppDispatch, useAppSelector } from "../../hooks/redux"
import { GoogleOAuthManager } from "../../oauth/google-oauth-manager"
import { authService } from "../../services/auth-service"
import { setOAuthData } from "../../redux/auth/auth-slice"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../utils/axios-error-handler"
import { openFixedLoadingHandler, pureNavigator } from "../../utils/helpers"

const LoginWithGoogle = () => {
  const { googleOAuthData } = useAppSelector(({ auth }) => auth)
  const googleOAuthManager = useRef<GoogleOAuthManager>()
  const dispatch = useAppDispatch()

  const openOAuthLogin = () => {
    googleOAuthManager.current?.openSignInPopup()
  }

  const initGoogleOAuthManager = () => {
    // đã bỏ
    // if (googleOAuthData) {
    //    googleOAuthManager.current = new GoogleOAuthManager(
    //       googleOAuthData.clientId,
    //       googleOAuthData.redirectURI,
    //       googleOAuthData.scope,
    //    )
    //    googleOAuthManager.current.onGetCode((code) => {
    //       openFixedLoadingHandler(true)
    //       authService
    //          .exchangeOAuthCode(code)
    //          .then(() => {
    //             pureNavigator("/workspace")
    //          })
    //          .catch((error) => {
    //             toast.error(axiosErrorHandler.handleHttpError(error).message)
    //          })
    //          .finally(() => {
    //             openFixedLoadingHandler(false)
    //          })
    //    })
    // }
  }

  useEffect(() => {
    initGoogleOAuthManager()
    return () => {
      googleOAuthManager.current?.quit()
    }
  }, [googleOAuthData])

  const fetchGoogleOAuthData = () => {
    // đã bỏ
    // authService
    //    .getGoogleOAuthCredentials()
    //    .then((res) => {
    //       dispatch(setOAuthData(res))
    //    })
    //    .catch((error) => {
    //       toast.error(axiosErrorHandler.handleHttpError(error).message)
    //    })
  }

  useEffect(() => {
    fetchGoogleOAuthData()
  }, [])

  return (
    googleOAuthData && (
      <button
        onClick={openOAuthLogin}
        className="flex items-center justify-center gap-2 rounded border border-[#c1c7d0] h-9 px-10"
      >
        <img src={googleLogo} alt="Google Logo" height={24} width={24} />
        <span className="text-black text-base">Sign in with Google</span>
      </button>
    )
  )
}

export const OAuth = () => {
  // return (
  //    <div className="mt-5 w-full">
  //       <p className="w-full text-center">Or continue with:</p>
  //       <div className="flex flex-col items-center mt-3 w-full">
  //          <LoginWithGoogle />
  //       </div>
  //    </div>
  // )

  return <div></div>
}
