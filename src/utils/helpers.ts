import dayjs from "dayjs"
import { EInternalEvents, eventEmitter } from "./events"
import type { SnackbarOrigin } from "@mui/material"
import { EProjectRoles } from "./enums"
import type { Area } from "react-easy-crop"
import DOMPurify from "dompurify"

export const pureNavigator = (href: string, isReloadPage?: boolean): void => {
  if (isReloadPage) {
    window.location.reload()
  } else {
    window.location.href = href || "/"
  }
}

/**
 * Function to delay a period of time before continue to execute the next codes
 * @param delayInMs time in miliseconds to wait
 * @returns a promise with boolean value
 */
export const perfomDelay = (delayInMs: number): Promise<boolean> =>
  new Promise<boolean>((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, delayInMs)
  })

export const measureTextWidth = (text: string, font: string): number => {
  const context = document.createElement("canvas").getContext("2d")!
  context.font = font
  return context.measureText(text).width
}

/**
 * Generate a random number in min to max ([min,max])
 * @param min an integer to begin
 * @param max an integer to end
 * @returns a random number in min to max ([min,max])
 */
export const randomInteger = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const displayTimeAgo = (originalTime: Date | string): string => {
  const now = dayjs()
  const convertedTime = dayjs(originalTime)
  const diffInMinutes = now.diff(convertedTime, "minute")

  if (diffInMinutes < 1) {
    return "Just now"
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  }
  const diffInHours = now.diff(convertedTime, "hour")
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  }
  const diffInDays = now.diff(convertedTime, "day")
  if (diffInDays < 31) {
    return `${diffInDays} days ago`
  }
  return convertedTime.format("MMM DD YYYY")
}

export const openFixedLoadingHandler = (isOpen: boolean): void => {
  eventEmitter.emit(EInternalEvents.OPEN_FIXED_LOADING, isOpen)
}

export const openAppSnackbarHandler = (
  message: string | React.JSX.Element,
  anchorOrigin?: SnackbarOrigin,
): void => {
  eventEmitter.emit(EInternalEvents.OPEN_APP_SNACKBAR, message, anchorOrigin)
}

export const displayProjectRole = (projectRole: EProjectRoles): string => {
  switch (projectRole) {
    case EProjectRoles.ADMIN:
      return "Admin"
    case EProjectRoles.LEADER:
      return "Leader"
  }
  return "Member"
}

export const checkFetchedState = <T extends string[]>(
  fetchedList: T,
  ...statesToCheck: T[number][]
) => {
  for (const state of statesToCheck) {
    if (!fetchedList.includes(state)) {
      return false
    }
  }
  return true
}

export const createWebWorker = (pathToWorkerFile: string): Worker => {
  return new Worker(new URL(pathToWorkerFile, import.meta.url), { type: "module" })
}

export const getCroppedImg = (imageSrc: string, croppedAreaPixels: Area): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = imageSrc
    image.crossOrigin = "anonymous" // Đảm bảo load ảnh từ nguồn bên ngoài không bị lỗi CORS

    image.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("Canvas context is null"))
        return
      }

      // Set kích thước của canvas theo vùng crop
      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height

      // Vẽ ảnh đã crop lên canvas
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      )

      // Chuyển canvas thành Data URL hoặc Blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error("Failed to create Blob"))
        }
      }, "image/png")
    }

    image.onerror = (error) => reject(error)
  })
}

type TStringKeyObject = {
  [key: string]: string
}

export const generateRouteWithParams = <T extends TStringKeyObject>(
  route: string,
  params: T,
): string => {
  return `${route}?${new URLSearchParams(params).toString()}`
}

export const sanitizeHTMLString = (htmlString: string) => DOMPurify.sanitize(htmlString)

export const createImageUrlEndpoint = (filename: string): string => {
  /**
   * URL hình ảnh sẽ có dạng: http://localhost:8080/api/files/images/{tên_file}
   */
  return `${import.meta.env.VITE_API_ENDPOINT_PREFIX}/files/images/${filename}`
}

export const getCssVar = (varName: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}
