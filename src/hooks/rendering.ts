import { useReducer } from "react"

type TForceUpdateHandler = () => () => void

export const useForceUpdate: TForceUpdateHandler = () => {
   const [, forceUpdate] = useReducer((pre) => !pre, true)
   return () => {
      forceUpdate()
   }
}
