import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { EAuthStatus } from "../../utils/enums"
import type { TGoogleOAuthData } from "../../services/types"

type TInitialState = {
   authStatus: EAuthStatus
   googleOAuthData: TGoogleOAuthData | null
}

const initialState: TInitialState = {
   authStatus: EAuthStatus.UNKNOWN,
   googleOAuthData: null,
}

export const authSlice = createSlice({
   name: "auth",
   initialState,
   reducers: {
      setAuthStatus: (state, action: PayloadAction<EAuthStatus>) => {
         state.authStatus = action.payload
      },
      setOAuthData: (state, action: PayloadAction<TGoogleOAuthData>) => {
         state.googleOAuthData = action.payload
      },
   },
})

export const { setAuthStatus, setOAuthData } = authSlice.actions
