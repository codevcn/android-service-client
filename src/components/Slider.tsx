import { useRef, MouseEvent, useEffect } from "react"

type TSlideIndex = number

type TSliderProps = {
  slides: React.JSX.Element[]
  className?: string
  spacing?: number
  controlleredIndex?: TSlideIndex
}

export const SwipeableSlider = ({
  slides,
  className,
  spacing = 0,
  controlleredIndex,
}: TSliderProps) => {
  const currentIndex = useRef<TSlideIndex>(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startPosition = useRef<number>()
  const currentTranslate = useRef<number>(0)
  const prevTranslate = useRef<number>(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    startPosition.current = e.clientX
    if (sliderRef.current) {
      sliderRef.current.style.transition = "none"
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!isDragging.current || !startPosition.current) return

    currentTranslate.current = e.clientX - startPosition.current

    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(calc(${prevTranslate.current}% + ${currentTranslate.current - spacing}px))`
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false

    const moveBy = currentTranslate.current
    if (Math.abs(moveBy) > 100) {
      if (moveBy > 0) {
        currentIndex.current = Math.max(currentIndex.current - 1, 0)
      } else {
        currentIndex.current = Math.min(currentIndex.current + 1, slides.length - 1)
      }
    }

    prevTranslate.current = currentIndex.current * -100
    if (sliderRef.current) {
      sliderRef.current.style.transition = "transform 0.3s ease"
      sliderRef.current.style.transform = `translateX(calc(${prevTranslate.current}% - ${spacing}px))`
    }
  }

  const handleMouseLeave = () => {
    if (isDragging.current) {
      handleMouseUp()
    }
  }

  useEffect(() => {
    if (controlleredIndex || controlleredIndex === 0) {
      prevTranslate.current = controlleredIndex * -100
      if (sliderRef.current) {
        sliderRef.current.style.transition = "transform 0.3s ease"
        sliderRef.current.style.transform = `translateX(calc(${prevTranslate.current}% - ${spacing}px))`
      }
    }
  }, [controlleredIndex])

  return (
    <div
      className={`${className} relative w-full overflow-hidden cursor-grab`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={sliderRef}
        className="flex transition-transform duration-300 ease-in-out w-full"
        onDragStart={(e) => e.preventDefault()}
        style={{ columnGap: `${spacing}px` }}
      >
        {slides}
      </div>
    </div>
  )
}
