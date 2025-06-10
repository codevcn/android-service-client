import { useAppSelector } from "../../hooks/redux"

export const Background = () => {
   const { project } = useAppSelector(({ project }) => project)
   const projectBackground = project?.background

   return (
      <div
         className="absolute inset-0 z-10 bg-cover bg-[center_center] bg-blend-darken bg-fade-layer-bgcl"
         style={{
            backgroundImage: projectBackground ? `url(${projectBackground})` : "none",
         }}
      ></div>
   )
}
