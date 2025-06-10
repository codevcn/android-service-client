import { Drawer, Popover, styled } from "@mui/material"
import { useEffect, useState } from "react"
import { EInternalEvents, eventEmitter } from "../../../utils/events"
import { useAppSelector } from "../../../hooks/redux"
import CloseIcon from "@mui/icons-material/Close"
import LogoutIcon from "@mui/icons-material/Logout"
import { AboutProject } from "./AboutProject"
import { openFixedLoadingHandler, pureNavigator } from "../../../utils/helpers"
import { projectService } from "../../../services/project-service"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../../utils/axios-error-handler"
import { ProjectMenuContext, useProjectMenuContext } from "./sharing"
import type { TProjectMenuActive } from "./sharing"
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew"
import { ProjectBackground } from "./ProjectBackground"
import { useUserInProject } from "../../../hooks/user"
import DeleteIcon from "@mui/icons-material/Delete"

type TTitleSectionProps = {
  onCloseMenu: () => void
}

const TitleSection = ({ onCloseMenu }: TTitleSectionProps) => {
  const { activeMenuItem, setActiveMenuItem } = useProjectMenuContext()

  const displayTitle = (active: TProjectMenuActive) => {
    switch (active) {
      case "about-project":
        return "About Project"
    }
    return "Project Menu"
  }

  return (
    <header className="relative py-2 px-3 w-full">
      {activeMenuItem && (
        <button
          onClick={() => setActiveMenuItem(undefined)}
          className="flex absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-modal-btn-hover-bgcl"
        >
          <ArrowBackIosNewIcon className="text-modal-text-cl" sx={{ height: 18, width: 18 }} />
        </button>
      )}
      <h3 className="w-full text-center text-base font-bold text-regular-text-cl">
        {displayTitle(activeMenuItem)}
      </h3>
      <button
        onClick={onCloseMenu}
        className="flex absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-modal-btn-hover-bgcl"
      >
        <CloseIcon className="text-regular-text-cl" fontSize="small" />
      </button>
    </header>
  )
}

type TContextProviderProps = {
  children: React.JSX.Element
}

const ContextProvider = ({ children }: TContextProviderProps) => {
  const [activeMenuItem, setActiveMenuItem] = useState<TProjectMenuActive>()

  return (
    <ProjectMenuContext.Provider value={{ activeMenuItem, setActiveMenuItem }}>
      {children}
    </ProjectMenuContext.Provider>
  )
}

const LeaveDeleteProject = () => {
  const [anchorEle, setAnchorEle] = useState<HTMLButtonElement | null>(null)
  const projectData = useAppSelector(({ project }) => project.project!)
  const userInProject = useUserInProject()!
  const isProjectOwner = projectData.ownerId === userInProject.id

  const handleOpenLeaveDeleteProject = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      setAnchorEle(e.currentTarget)
    } else {
      setAnchorEle(null)
    }
  }

  const handleLeaveDeleteProject = () => {
    openFixedLoadingHandler(true)
    if (isProjectOwner) {
      projectService
        .deleteProject(projectData.id)
        .then(() => {
          pureNavigator("/workspace", true)
        })
        .catch((error) => {
          toast.error(axiosErrorHandler.handleHttpError(error).message)
        })
    } else {
      projectService
        .leaveProject(projectData.id)
        .then(() => {
          pureNavigator("/workspace", true)
        })
        .catch((error) => {
          toast.error(axiosErrorHandler.handleHttpError(error).message)
        })
    }
  }

  return (
    <div className="relative z-10">
      <button
        onClick={handleOpenLeaveDeleteProject}
        className="flex items-center gap-x-3 p-2 hover:bg-modal-btn-hover-bgcl rounded w-full mt-1"
      >
        {isProjectOwner ? (
          <>
            <DeleteIcon fontSize="small" />
            <p className="w-fit">Delete this project</p>
          </>
        ) : (
          <>
            <LogoutIcon fontSize="small" />
            <p className="w-fit">Leave this project</p>
          </>
        )}
      </button>

      <StyledPopover
        open={!!anchorEle}
        anchorEl={anchorEle}
        onClose={() => handleOpenLeaveDeleteProject()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <div className="bg-modal-popover-bgcl rounded-md p-3 text-regular-text-cl w-[300px]">
          <div className="relative w-full py-1">
            <h3 className="w-full text-center text-sm font-bold">Delete this project</h3>
            <button
              onClick={() => handleOpenLeaveDeleteProject()}
              className="flex absolute right-0 top-0 p-1 rounded-md hover:bg-modal-btn-hover-bgcl"
            >
              <CloseIcon className="text-regular-text-cl" fontSize="small" />
            </button>
          </div>
          <p className="text-sm mt-2">Deleting a project is forever. There is no undo.</p>
          <button
            onClick={handleLeaveDeleteProject}
            className="text-sm mt-2 bg-delete-btn-bgcl rounded-md p-1 w-full text-black font-bold hover:bg-delete-btn-hover-bgcl"
          >
            Delete project
          </button>
        </div>
      </StyledPopover>
    </div>
  )
}

export const ProjectMenu = () => {
  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    eventEmitter.on(EInternalEvents.OPEN_PROJECT_MENU, (isOpen) => {
      setOpen(isOpen)
    })
    return () => {
      eventEmitter.off(EInternalEvents.OPEN_PROJECT_MENU)
    }
  }, [])

  return (
    <StyledDrawer anchor="right" open={open} onClose={() => setOpen(false)} keepMounted>
      <ContextProvider>
        <section className="flex flex-col py-3 h-full">
          <TitleSection onCloseMenu={() => setOpen(false)} />
          <hr className="my-2" />
          <div className="css-styled-vt-scrollbar overflow-y-auto overflow-x-hidden text-modal-text-cl text-sm px-3 grow relative">
            {/* <AboutProject projectData={projectData} />
            <ProjectBackground
              projectBackground={projectData.background}
              projectId={projectData.id}
            />
            <hr className="my-2" /> */}
            <LeaveDeleteProject />
          </div>
        </section>
      </ContextProvider>
    </StyledDrawer>
  )
}

const StyledDrawer = styled(Drawer)({
  "&.MuiDrawer-root": {
    "& .MuiDrawer-paper": {
      width: 350,
      backgroundColor: "var(--ht-modal-board-bgcl)",
    },
  },
})

const StyledPopover = styled(Popover)({
  "& .MuiPaper-root": {
    borderRadius: 6,
    backgroundColor: "var(--ht-modal-popover-bgcl)",
    border: "1px var(--ht-regular-border-cl) solid",
  },
})
