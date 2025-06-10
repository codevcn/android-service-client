import { clientAxios } from "../../configs/api-configs"
import type { TLoginInput, TSignupInput } from "./types/input-types"
import type { TAuthResponse, TMessageResponse } from "./types/output-types"

export const apiSignup = async (payload: TSignupInput): Promise<TAuthResponse> =>
  clientAxios.post("/auth/signup", payload)

export const apiLogin = async (payload: TLoginInput): Promise<TAuthResponse> =>
  clientAxios.post("/auth/login", payload)

export const apiLogout = async (): Promise<TMessageResponse> => clientAxios.post("/auth/logout")
