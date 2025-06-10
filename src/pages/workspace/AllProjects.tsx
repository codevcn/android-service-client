import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard"
import StarIcon from "@mui/icons-material/Star"
import { useCallback, useEffect, useRef, useState } from "react"
import { useAppDispatch } from "../../hooks/redux"
import StarOutlineIcon from "@mui/icons-material/StarOutline"
import { TProjectPreviewData } from "../../services/types"
import { setFilterResult, updateSingleProject } from "../../redux/workspace/workspace-slice"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import SearchIcon from "@mui/icons-material/Search"
import { useDebounce } from "../../hooks/debounce"
import AddIcon from "@mui/icons-material/Add"
import { Popover, Fade, styled, Tooltip } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import PriorityHighIcon from "@mui/icons-material/PriorityHigh"
import { NavLink } from "react-router-dom"
import { LogoLoading } from "../../components/Loadings"
import { projectService } from "../../services/project-service"
import axiosErrorHandler from "../../utils/axios-error-handler"
import { toast } from "react-toastify"
import { EInternalEvents, eventEmitter } from "../../utils/events"
import { ExtraFilter } from "./ExtraFilter"
import type {
  TFilterProjectsData,
  TFilterProjectsWorkerMsg,
  TFilterProjectsWorkerRes,
} from "../../utils/types"
import { createWebWorker } from "../../utils/helpers"

type TAddNewProjectFormData = {
  projectTitle?: string
}

const AddNewProject = () => {
  const [anchorEle, setAnchorEle] = useState<HTMLElement | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState<TAddNewProjectFormData>({})
  const [loading, setLoading] = useState<boolean>(false)

  const handleOpen = (e?: React.MouseEvent<HTMLElement>) => {
    if (e) {
      setAnchorEle(e.currentTarget)
    } else {
      setAnchorEle(null)
    }
  }

  const typing = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ projectTitle: e.target.value })
  }

  const createNewProject = () => {
    const { projectTitle } = formData
    if (projectTitle) {
      setLoading(true)
      projectService
        .createNewProject(projectTitle)
        .then(() => {
          eventEmitter.emit(EInternalEvents.REFRESH_PROJECTS)
        })
        .catch((error) => {
          toast.error(axiosErrorHandler.handleHttpError(error).message)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center justify-center gap-x-1 p-2 h-[100px] bg-modal-popover-bgcl text-base rounded hover:bg-hover-silver-bgcl"
      >
        <AddIcon fontSize="small" />
        <span>Create new project</span>
      </button>

      <StyledPopover
        anchorEl={anchorEle}
        open={!!anchorEle}
        onClose={() => handleOpen()}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div className="bg-modal-popover-bgcl text-modal-text-cl pt-3 rounded-lg w-full h-full">
          <header className="pt-1 pb-4 px-5 items-center">
            <h3 className="text-regular-text-cl font-semibold text-sm text-center">
              Create project
            </h3>
            <button
              onClick={() => handleOpen()}
              className="flex h-8 w-8 hover:bg-hover-silver-bgcl rounded absolute top-2 right-2"
            >
              <CloseIcon fontSize="small" className="text-regular-text-cl m-auto" />
            </button>
          </header>
          <form
            ref={formRef}
            onSubmit={(e) => e.preventDefault()}
            className="css-styled-vt-scrollbar overflow-y-auto grow px-4 pb-3"
          >
            <div>
              <label className="block text-sm font-bold mb-1 w-fit" htmlFor="filter-keyword">
                Keyword
              </label>
              <input
                className={`${formData.projectTitle ? "border-regular-border-cl" : "border-red-600"} w-full px-2 py-1 inset-0 focus:border-outline-cl bg-focused-textfield-bgcl border-2 rounded text-regular-text-cl placeholder-gray-500`}
                id="filter-keyword"
                placeholder="Enter project title..."
                type="text"
                onChange={typing}
                name="project-title"
              />
              <p className="flex items-center gap-1 text-xs text-regular-text-cl mt-1">
                <PriorityHighIcon sx={{ height: 18, width: 18 }} />
                <span>Project title is required</span>
              </p>
            </div>
            <button
              onClick={createNewProject}
              className={`${formData.projectTitle ? "hover:bg-confirm-btn-hover-bgcl bg-confirm-btn-bgcl text-black" : "opacity-70 cursor-no-drop bg-modal-btn-bgcl text-regular-text-cl"} px-2 py-1.5 mt-4 w-full font-bold rounded text-sm`}
            >
              {loading ? (
                <div className="flex w-full h-[20px]">
                  <LogoLoading size="small" className="m-auto" color="var(--ht-regular-bgcl)" />
                </div>
              ) : (
                <span>Create</span>
              )}
            </button>
          </form>
        </div>
      </StyledPopover>
    </>
  )
}

type TProjectPreviewProps = {
  projectPreviewData: TProjectPreviewData
}

export const ProjectPreview = ({ projectPreviewData }: TProjectPreviewProps) => {
  const { background, starred, title, id } = projectPreviewData
  const dispatch = useAppDispatch()

  const handleMarkStarred = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(updateSingleProject({ starred: !starred, id }))
  }

  return (
    <NavLink
      style={{
        backgroundImage: background
          ? `url(${background})`
          : "linear-gradient(to bottom, var(--ht-purple-from-ligr), var(--ht-pink-to-ligr))",
      }}
      to={`/projects/${id}`}
      className="group/root relative p-2 h-[100px] bg-cover bg-center rounded overflow-hidden cursor-pointer"
    >
      <span className="bg-fade-layer-bgcl absolute inset-0 z-10 group-hover/root:bg-[#00000066]"></span>
      <div className="relative z-20 h-full w-full">
        <span className="text-white font-semibold max-w-full break-words">{title}</span>
      </div>
      {/* <button
            onClick={handleMarkStarred}
            className={`${starred ? "right-2" : "-right-[25px] group-hover/root:right-2"} absolute bottom-2 hover:scale-125 text-starred-cl z-30 transition-[right,transform]`}
         >
            {starred ? (
               <StarIcon sx={{ height: 20, width: 20 }} color="inherit" />
            ) : (
               <StarOutlineIcon sx={{ height: 20, width: 20 }} color="inherit" />
            )}
         </button> */}
    </NavLink>
  )
}

type TFilterDataExists<T> = Exclude<T, undefined>

type TAllProjectsProps = {
  filteredProjects: TProjectPreviewData[] | null
  originalProjects: TProjectPreviewData[] | null
}

export const AllProjects = ({ filteredProjects, originalProjects }: TAllProjectsProps) => {
  const dispatch = useAppDispatch()
  const debounce = useDebounce()
  const filterDataRef = useRef<TFilterProjectsData>({})
  const filterProjectsWorker = useRef<Worker>()

  const checkFilterDataExists = (
    filterData: TFilterProjectsData,
  ): filterData is TFilterDataExists<typeof filterData> => {
    if (Object.keys(filterData).length === 0) return false
    let count: number = 0
    for (const key in filterData) {
      if (filterData[key as keyof TFilterProjectsData]) {
        count++
      }
    }
    return count > 0
  }

  const filterProjects = (partialData: TFilterProjectsData): void => {
    const filterData = { ...filterDataRef.current, ...partialData }
    filterDataRef.current = filterData
    if (originalProjects && originalProjects.length > 0) {
      if (checkFilterDataExists(filterData)) {
        const message: TFilterProjectsWorkerMsg = {
          projects: originalProjects,
          filterData,
        }
        filterProjectsWorker.current?.postMessage(message)
      } else {
        dispatch(setFilterResult(null))
      }
    }
  }

  const cancelSearch = () => {
    dispatch(setFilterResult(null))
  }

  const searchProject = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      const keyword = e.target.value
      if (keyword && keyword.length > 0) {
        filterProjects({ title: keyword })
      } else {
        cancelSearch()
      }
    }, 500),
    [originalProjects],
  )

  const handleOpenFilter = () => {
    eventEmitter.emit(EInternalEvents.OPEN_PROJECTS_FILTER)
  }

  const doFilterWithResult = (projectIds: TFilterProjectsWorkerRes) => {
    dispatch((dispatch, getState) => {
      const filteredProjects = getState().workspace.projects
      if (!filteredProjects || filteredProjects.length === 0) return
      dispatch(setFilterResult(filteredProjects.filter(({ id }) => projectIds.includes(id))))
    })
  }

  useEffect(() => {
    filterProjectsWorker.current = createWebWorker("/src/workers/filter-projects-worker.ts")
    filterProjectsWorker.current.onmessage = (e: MessageEvent<TFilterProjectsWorkerRes>) => {
      doFilterWithResult(e.data)
    }
    return () => {
      filterProjectsWorker.current?.terminate()
    }
  }, [])

  return (
    <section className="w-full">
      <div className="flex items-center justify-between gap-5 mb-3">
        <a id="all-projects-list" className="flex items-center gap-2" href="#all-projects-list">
          <SpaceDashboardIcon fontSize="small" />
          <h2 className="text-lg font-semibold">Your Projects</h2>
        </a>
        <div className="flex items-center gap-2">
          <div className="border border-[#8C9BAB] border-solid rounded hover:bg-hover-silver-bgcl">
            <input
              type="text"
              className="bg-transparent outline-none px-2 py-1 pr-3 text-sm"
              placeholder="Enter project's name..."
              onChange={searchProject}
            />
            <SearchIcon className="mr-2" color="inherit" fontSize="small" />
          </div>
          <Tooltip title="Extra filter" arrow>
            <button onClick={handleOpenFilter} className="p-1 rounded hover:bg-hover-silver-bgcl">
              <FilterAltIcon fontSize="small" />
            </button>
          </Tooltip>
        </div>
      </div>
      {originalProjects && <ExtraFilter projects={originalProjects} onFilter={filterProjects} />}
      {filteredProjects ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProjects.length > 0 &&
            filteredProjects.map((project) => (
              <ProjectPreview key={project.id} projectPreviewData={project} />
            ))}
          <AddNewProject />
        </div>
      ) : (
        <div className="flex w-full justify-center pt-10">
          <LogoLoading />
        </div>
      )}
    </section>
  )
}

const StyledPopover = styled(Popover)({
  "& .MuiPaper-root": {
    borderRadius: 8,
    backgroundColor: "var(--ht-modal-popover-bgcl)",
    height: "fit-content",
    maxHeight: "calc(100vh - var(--ht-top-nav-height) - var(--ht-top-nav-height))",
    width: 380,
    border: "1px #acb4c126 solid",
    "& .MuiList-root": {
      backgroundColor: "var(--ht-modal-popover-bgcl)",
      borderRadius: 8,
    },
  },
})
