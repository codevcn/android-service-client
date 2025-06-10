import { useEffect } from "react"
import { TGoogleOAuthMsgData } from "../../utils/types"
import { EAppMessageTypes } from "../../utils/enums"
import { LogoLoading } from "../../components/Loadings"

const AuthRedirectPage = () => {
   const sendCode = () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      let data: TGoogleOAuthMsgData
      if (code) {
         data = {
            appMsgType: EAppMessageTypes.OAUTH_SUCCESS,
            code,
         }
      } else {
         data = {
            appMsgType: EAppMessageTypes.OAUTH_ERROR,
            code: null,
         }
      }
      const originalWindow = window.opener as Window
      originalWindow.postMessage(data, window.location.origin)
      window.close()
   }

   useEffect(() => {
      sendCode()
   }, [])

   return (
      <div className="flex flex-col items-center justify-center bg-gray-100 h-screen w-screen p-5">
         <div>
            <LogoLoading color="black" />
         </div>
         <div className="flex flex-col items-center justify-center text-center mt-10">
            <h1 className="text-2xl font-bold text-gray-800">Processing authorization code...</h1>
            <p className="mt-4 text-gray-600">Please wait for few minutes.</p>
         </div>
      </div>
   )
}

export default AuthRedirectPage
