type TAppLogoProps = Partial<{
   width: number
   height: number
   barSpacing: number
   barWidth: number
   color: string
}>

export const AppLogo = ({
   width = 15,
   height = 10,
   barSpacing = 3,
   barWidth = 3,
   color = "var(--ht-regular-text-cl)",
}: TAppLogoProps) => {
   return (
      <svg
         width={width}
         height={height}
         viewBox={`0 0 ${width} ${height}`}
         xmlns="http://www.w3.org/2000/svg"
      >
         <rect x="0" y="0" width={barWidth} height={height * 0.75} fill={color} />
         <rect
            x={barWidth + barSpacing}
            y="0"
            width={barWidth}
            height={height * 0.5}
            fill={color}
         />
         <rect
            x={barWidth * 2 + barSpacing * 2}
            y="0"
            width={barWidth}
            height={height}
            fill={color}
         />
      </svg>
   )
}
