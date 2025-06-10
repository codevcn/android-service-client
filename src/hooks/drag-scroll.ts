import { useCallback, useEffect, useRef } from "react"

export const useDragScroll = () => {
   const dragNodeRef = useRef<HTMLElement | null>(null)
   const scrollNodeRef = useRef<HTMLElement | null>(null)

   const refToScroll = useCallback((nodeEle: HTMLElement | null) => {
      scrollNodeRef.current = nodeEle
   }, [])

   const refToDrag = useCallback((nodeEle: HTMLElement | null) => {
      dragNodeRef.current = nodeEle
   }, [])

   const handleMouseDown = useCallback(
      (e: MouseEvent) => {
         const scrollNode = scrollNodeRef.current
         if (scrollNode) {
            const startPos = {
               left: scrollNode.scrollLeft,
               top: scrollNode.scrollTop,
               x: e.clientX,
               y: e.clientY,
            }

            const handleMouseMove = (e: MouseEvent) => {
               const dx = e.clientX - startPos.x
               const dy = e.clientY - startPos.y
               scrollNode.scrollTop = startPos.top - dy
               scrollNode.scrollLeft = startPos.left - dx
               updateCursor(scrollNode)
            }

            const handleMouseUp = () => {
               document.removeEventListener("mousemove", handleMouseMove)
               document.removeEventListener("mouseup", handleMouseUp)
               resetCursor(scrollNode)
            }

            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
         }
      },
      [scrollNodeRef.current],
   )

   const handleTouchStart = useCallback(
      (e: TouchEvent) => {
         const scrollNode = scrollNodeRef.current
         if (scrollNode) {
            const touch = e.touches[0]
            const startPos = {
               left: scrollNode.scrollLeft,
               top: scrollNode.scrollTop,
               x: touch.clientX,
               y: touch.clientY,
            }

            const handleTouchMove = (e: TouchEvent) => {
               const touch = e.touches[0]
               const dx = touch.clientX - startPos.x
               const dy = touch.clientY - startPos.y
               scrollNode.scrollTop = startPos.top - dy
               scrollNode.scrollLeft = startPos.left - dx
               updateCursor(scrollNode)
            }

            const handleTouchEnd = () => {
               document.removeEventListener("touchmove", handleTouchMove)
               document.removeEventListener("touchend", handleTouchEnd)
               resetCursor(scrollNode)
            }

            document.addEventListener("touchmove", handleTouchMove)
            document.addEventListener("touchend", handleTouchEnd)
         }
      },
      [scrollNodeRef.current],
   )

   const updateCursor = (ele: HTMLElement) => {
      ele.style.cursor = "grabbing"
      ele.style.userSelect = "none"
   }

   const resetCursor = (ele: HTMLElement) => {
      ele.style.cursor = "grab"
      ele.style.removeProperty("user-select")
   }

   useEffect(() => {
      const dragNode = dragNodeRef.current
      const scrollNode = scrollNodeRef.current
      if (dragNode && scrollNode) {
         dragNode.addEventListener("mousedown", handleMouseDown)
         dragNode.addEventListener("touchstart", handleTouchStart)
         return () => {
            dragNode.removeEventListener("mousedown", handleMouseDown)
            dragNode.removeEventListener("touchstart", handleTouchStart)
         }
      }
   }, [dragNodeRef.current, scrollNodeRef.current])

   return [refToScroll, refToDrag]
}
