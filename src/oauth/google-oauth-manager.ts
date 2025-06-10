import { toast } from "react-toastify"
import { EAppMessageTypes } from "../utils/enums"
import { generateRouteWithParams } from "../utils/helpers"
import type { TGoogleOAuthMsgData } from "../utils/types"

type TOnGetCodeHandler = (code: string) => void

export class GoogleOAuthManager {
   private authURL: string | null
   private signInPopup: Window | null
   private listener: ((e: MessageEvent<TGoogleOAuthMsgData>) => void) | null

   constructor(googleClientId: string, redirectURI: string, scope: string) {
      this.authURL = generateRouteWithParams("https://accounts.google.com/o/oauth2/v2/auth", {
         client_id: googleClientId,
         redirect_uri: redirectURI,
         response_type: "code",
         scope: scope,
         state: Math.random().toString(36).substring(7), // Chuỗi ngẫu nhiên để tránh CSRF
         prompt: "select_account",
      })
      this.signInPopup = null
      this.listener = null
   }

   openSignInPopup(): void {
      const width = 500,
         height = 600
      const left = (window.innerWidth - width) / 2
      const top = (window.innerHeight - height) / 2
      this.signInPopup = window.open(
         this.authURL!,
         "Google Login",
         `width=${width},height=${height},top=${top},left=${left}`,
      )
   }

   onGetCode(handler: TOnGetCodeHandler): void {
      this.listener = (e) => {
         if (e.origin !== window.location.origin) return
         const data = e.data
         if (data) {
            if (data.appMsgType === EAppMessageTypes.OAUTH_SUCCESS) {
               const authorizationCode = data.code
               if (authorizationCode) {
                  handler(authorizationCode)
               }
            } else if (data.appMsgType === EAppMessageTypes.OAUTH_ERROR) {
               toast.error("Fail to login with Google")
            }
         }
      }
      window.addEventListener("message", this.listener)
   }

   quit(): void {
      if (this.listener) {
         window.removeEventListener("message", this.listener)
      }
      this.signInPopup = null
      this.authURL = null
   }
}
