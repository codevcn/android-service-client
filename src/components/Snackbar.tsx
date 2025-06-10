import { Snackbar, Grow } from "@mui/material"
import { useEffect, useState } from "react"
import { EInternalEvents, eventEmitter } from "../utils/events"
import type { SnackbarOrigin } from "@mui/material/Snackbar"

type TAppSnackbarState = {
  open: boolean
  anchorOrigin: SnackbarOrigin
  message: string | React.JSX.Element
}

export const AppSnackbar = () => {
  const defaultAnchorOrigin: SnackbarOrigin = {
    vertical: "bottom",
    horizontal: "center",
  }

  const [state, setState] = useState<TAppSnackbarState>({
    open: false,
    anchorOrigin: defaultAnchorOrigin,
    message: "",
  })

  useEffect(() => {
    eventEmitter.on(EInternalEvents.OPEN_APP_SNACKBAR, (message, anchorOrigin) => {
      setState((pre) => ({
        ...pre,
        open: true,
        message,
        anchorOrigin: anchorOrigin || defaultAnchorOrigin,
      }))
    })
    return () => {
      eventEmitter.off(EInternalEvents.OPEN_APP_SNACKBAR)
    }
  }, [])

  const handleClose = () => {
    setState((pre) => ({ ...pre, open: false }))
  }

  return (
    <Snackbar
      anchorOrigin={state.anchorOrigin}
      open={state.open}
      onClose={handleClose}
      message={state.message}
      autoHideDuration={2000}
      TransitionComponent={Grow}
    />
  )
}
