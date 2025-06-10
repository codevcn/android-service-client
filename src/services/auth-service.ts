// đã sửa xong file này

import type { TLoginPayload, TRegisterPayload, TUserData } from "./types"
import type { TSuccess } from "../utils/types"
import { apiLogin, apiLogout, apiSignup } from "./apis/auth-apis"
import { apiGetCurrentUser } from "./apis/user-apis"
import { convertUserApiData } from "../utils/api-converters/api-converters"

class AuthService {
  async login(payload: TLoginPayload): Promise<TSuccess> {
    const { email, password } = payload
    await apiLogin({ usernameOrEmail: email, password })
    return { success: true }
  }

  async register(payload: TRegisterPayload): Promise<TSuccess> {
    await apiSignup({ username: payload.email, ...payload })
    return { success: true }
  }

  async checkAuth(): Promise<TUserData> {
    const { data } = await apiGetCurrentUser()
    if (!data) throw new Error("User not found")
    return convertUserApiData(data.data)
  }

  // đã bỏ
  // async getGoogleOAuthCredentials(): Promise<TGoogleOAuthData> {
  //   await perfomDelay(1000)
  //   const data: TGoogleOAuthData = {
  //     clientId: "545889255969-mp33ncvcd1dm7kfffmpfbvassiqalopo.apps.googleusercontent.com",
  //     redirectURI: "http://localhost:5173/google-auth-redirect",
  //     scope: "openid email profile",
  //   }
  //   return data
  // }

  // đã bỏ
  // async exchangeOAuthCode(code: string): Promise<TSuccess> {
  //   await perfomDelay(1000)
  //   return { success: true }
  // }

  async logout(): Promise<TSuccess> {
    await apiLogout()
    return { success: true }
  }
}

export const authService = new AuthService()
