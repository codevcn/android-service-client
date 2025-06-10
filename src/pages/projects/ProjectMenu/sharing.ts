import { createContext, useContext } from "react"

export type TProjectMenuActive = "about-project" | "project-background" | undefined

export type TProjectMenuContext = {
   activeMenuItem: TProjectMenuActive
   setActiveMenuItem: React.Dispatch<React.SetStateAction<TProjectMenuActive>>
}

export const ProjectMenuContext = createContext<TProjectMenuContext>({
   activeMenuItem: undefined,
   setActiveMenuItem: () => {},
})

export const useProjectMenuContext = () => useContext(ProjectMenuContext)
