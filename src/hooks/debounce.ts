import { useRef } from "react"

export const useDebounce = () => {
  const timer = useRef<number | undefined>(undefined)
  return <P extends any[]>(func: (...args: P) => void, delayInMs: number) => {
    return (...args: Parameters<typeof func>) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        func(...args)
      }, delayInMs)
    }
  }
}
