import { useEffect, useState } from "react"
import LinearProgress from "@mui/material/LinearProgress"
import { EInternalEvents, eventEmitter } from "../utils/events"

export const RouteLoading = () => {
   return (
      <div className="flex flex-col justify-center items-center h-screen w-screen">
         <LogoLoading color="black" />
         <p className="text-base mt-5">Downloadng data...</p>
      </div>
   )
}

type TLogoLoadingProps = Partial<{
   className: string
   style: React.CSSProperties
   color: string
   size: "small" | "medium"
}>

export const LogoLoading = ({ className, color, style, size = "medium" }: TLogoLoadingProps) => {
   return (
      <div
         style={style}
         className={`${className || ""} ${size ? `size-${size}` : ""} css-logo-loading-container`}
      >
         <div
            style={{ backgroundColor: color }}
            className="css-logo-loading-bar loading-bar-1"
         ></div>
         <div
            style={{ backgroundColor: color }}
            className="css-logo-loading-bar loading-bar-2"
         ></div>
         <div
            style={{ backgroundColor: color }}
            className="css-logo-loading-bar loading-bar-3"
         ></div>
      </div>
   )
}

export const FixedLoading = () => {
   const [open, setOpen] = useState<boolean>(false)

   useEffect(() => {
      eventEmitter.on(EInternalEvents.OPEN_FIXED_LOADING, (isOpen) => {
         setOpen(isOpen)
      })
      return () => {
         eventEmitter.off(EInternalEvents.OPEN_FIXED_LOADING)
      }
   }, [])

   return (
      <div
         className="fixed z-[1500] top-0 left-0 w-screen h-fit text-confirm-btn-bgcl"
         hidden={!open}
      >
         <LinearProgress color="inherit" />
      </div>
   )
}
