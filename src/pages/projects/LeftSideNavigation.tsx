import { useAppSelector } from "../../hooks/redux"
import { Tooltip, Avatar } from "@mui/material"
import { useMemo, useState } from "react"
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft"
import SettingsIcon from "@mui/icons-material/Settings"
import { LogoLoading } from "../../components/Loadings"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import type { TProjectData, TProjectMemberData } from "../../services/types"
import { EProjectRoles } from "../../utils/enums"
import { NavLink } from "react-router-dom"
import { checkFetchedState } from "../../utils/helpers"

const StrangerViewport = () => {
  return (
    <div className="flex flex-col items-center m-auto text-sm text-modal-text-cl p-3">
      <p className="w-fit text-center">
        Because you're not member of this project, you cannot view any information about this
        project.
      </p>
    </div>
  )
}

type TCreatorViewportProps = {
  projectData: TProjectData
  onCloseNav: () => void
}

const Nav = ({ projectData, onCloseNav }: TCreatorViewportProps) => {
  const { members } = projectData

  const projectCreator = useMemo<TProjectMemberData>(() => {
    return members.find((member) => member.projectRole === EProjectRoles.ADMIN)!
  }, [members])

  return (
    <>
      <div className="flex items-center justify-between gap-x-2 px-3 py-3 border-b border-divider-cl w-full">
        <div className="flex items-center gap-x-2">
          <NavLink to="/profile">
            <>
              {projectCreator.avatar ? (
                <Avatar
                  src={projectCreator.avatar}
                  alt="User Avatar"
                  sx={{ height: 32, width: 32 }}
                />
              ) : (
                <Avatar alt="User Avatar" sx={{ height: 32, width: 32 }}>
                  {projectCreator.fullName[0]}
                </Avatar>
              )}
            </>
          </NavLink>
          <div className="font-semibold truncate max-w-40">
            <Tooltip title={projectData.title} arrow placement="bottom">
              <span>{projectData.title}</span>
            </Tooltip>
          </div>
        </div>
        <button
          onClick={onCloseNav}
          className="flex items-center justify-center p-2 hover:bg-hover-silver-bgcl cursor-pointer rounded h-[28px] w-[28px] overflow-hidden"
        >
          <ArrowLeftIcon fontSize="large" />
        </button>
      </div>
      <div className="py-3 border-b border-divider-cl">
        <div className="flex items-center gap-x-2 text-regular-text-cl py-2 px-3 hover:bg-hover-silver-bgcl cursor-pointer">
          <SettingsIcon sx={{ fontSize: 16 }} />
          <span>Menu Item</span>
        </div>
        <div className="flex items-center gap-x-2 text-regular-text-cl py-2 px-3 hover:bg-hover-silver-bgcl cursor-pointer">
          <SettingsIcon sx={{ fontSize: 16 }} />
          <span>Menu Item</span>
        </div>
        <div className="flex items-center gap-x-2 text-regular-text-cl py-2 px-3 hover:bg-hover-silver-bgcl cursor-pointer">
          <SettingsIcon sx={{ fontSize: 16 }} />
          <span>Menu Item</span>
        </div>
      </div>
      <div className="py-3 border-b border-divider-cl">
        <div className="flex items-center gap-x-2 text-regular-text-cl py-2 px-3 hover:bg-hover-silver-bgcl cursor-pointer">
          <SettingsIcon sx={{ fontSize: 16 }} />
          <span>Menu Item</span>
        </div>
        <div className="flex items-center gap-x-2 text-regular-text-cl py-2 px-3 hover:bg-hover-silver-bgcl cursor-pointer">
          <SettingsIcon sx={{ fontSize: 16 }} />
          <span>Menu Item</span>
        </div>
        <div className="flex items-center gap-x-2 text-regular-text-cl py-2 px-3 hover:bg-hover-silver-bgcl cursor-pointer">
          <SettingsIcon sx={{ fontSize: 16 }} />
          <span>Menu Item</span>
        </div>
      </div>
      <div className="py-3">
        <div className="flex items-center gap-x-2 text-regular-text-cl py-2 px-3 hover:bg-hover-silver-bgcl cursor-pointer">
          <SettingsIcon sx={{ fontSize: 16 }} />
          <span>Menu Item</span>
        </div>
        <div className="flex items-center gap-x-2 text-regular-text-cl py-2 px-3 hover:bg-hover-silver-bgcl cursor-pointer">
          <SettingsIcon sx={{ fontSize: 16 }} />
          <span>Menu Item</span>
        </div>
        <div className="flex items-center gap-x-2 text-regular-text-cl py-2 px-3 hover:bg-hover-silver-bgcl cursor-pointer">
          <SettingsIcon sx={{ fontSize: 16 }} />
          <span>Menu Item</span>
        </div>
      </div>
    </>
  )
}

export const LeftSideNavigation = () => {
  const { project, fetchedList } = useAppSelector(({ project }) => project)
  const [open, setOpen] = useState<boolean>(true)

  return (
    <nav
      className={`${open ? "w-left-side-nav" : "w-[20px]"} bg-regular-bgcl text-regular-text-cl relative overflow-x-visible transition-[width] h-full border-r border-divider-cl`}
    >
      <div
        className={`${open ? "translate-x-0" : "-translate-x-[260px]"} flex flex-col h-full w-full overflow-y-hidden overflow-x-hidden transition-transform`}
      >
        {project ? (
          <Nav projectData={project} onCloseNav={() => setOpen(false)} />
        ) : checkFetchedState(fetchedList, "project") ? (
          <StrangerViewport />
        ) : (
          <LogoLoading className="m-auto" />
        )}
      </div>
      <button
        hidden={open}
        onClick={() => setOpen(true)}
        className="flex absolute top-4 right-0 translate-x-1/2 border-divider-cl z-20 p-[5px] border border-solid rounded-full bg-regular-bgcl hover:bg-hover-silver-bgcl"
      >
        <ArrowForwardIosIcon sx={{ fontSize: 14, margin: "auto" }} />
      </button>
    </nav>
  )
}
