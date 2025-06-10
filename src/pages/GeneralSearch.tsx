import { useEffect, useRef, useState } from "react"
import { useDebounce } from "../hooks/debounce"
import { searchService } from "../services/search-service"
import type { TGeneralSearchData } from "../services/types"
import { toast } from "react-toastify"
import axiosErrorHandler from "../utils/axios-error-handler"
import AssignmentIcon from "@mui/icons-material/Assignment"
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService"
import { LogoLoading } from "../components/Loadings"
import SearchOffIcon from "@mui/icons-material/SearchOff"
import { useUser } from "../hooks/user"
import SearchIcon from "@mui/icons-material/Search"
import WorkIcon from "@mui/icons-material/Work"
import { NavigateOptions, useNavigate } from "react-router-dom"
import { generateRouteWithParams } from "../utils/helpers"
import { ENavigateStates, EQueryStringKeys } from "../utils/enums"

type TProjectsProps = {
  onClickSearchResult: (
    type: "task" | "phase" | "project",
    projectId: number,
    phaseId?: number,
    taskId?: number,
  ) => void
  searchResult: TGeneralSearchData
}

const Projects = ({ onClickSearchResult, searchResult }: TProjectsProps) => {
  const user = useUser()!

  return (
    <div>
      <h2 className="font-semibold mb-2 px-4">PROJECTS</h2>
      {searchResult.projects.map(({ id, title, background }) => (
        <div
          key={id}
          className="flex items-center gap-2 p-2 px-4 hover:bg-hover-silver-bgcl cursor-pointer"
          onClick={() => onClickSearchResult("project", id)}
        >
          {background ? (
            <img alt="Project background" className="w-8 h-8 rounded" src={background} />
          ) : (
            <div
              className="w-8 h-8 rounded"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom, var(--ht-purple-from-ligr), var(--ht-pink-to-ligr))",
              }}
            ></div>
          )}
          <div>
            <p className="text-light-text-cl">{title}</p>
            <p className="text-xs">
              <span>From user: </span>
              <span>{user.fullName}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

type TPhasesProps = {
  onClickSearchResult: (
    type: "task" | "phase" | "project",
    projectId: number,
    phaseId?: number,
    taskId?: number,
  ) => void
  searchResult: TGeneralSearchData
}

const Phases = ({ onClickSearchResult, searchResult }: TPhasesProps) => {
  return (
    <div className="mb-4">
      <h2 className="font-semibold mb-2 px-4">PHASES</h2>
      {searchResult.phases.map(({ id, title, project }) => (
        <div
          key={id}
          className="flex items-center gap-1 p-2 px-4 hover:bg-hover-silver-bgcl cursor-pointer"
          onClick={() => onClickSearchResult("phase", project.id, id)}
        >
          <HomeRepairServiceIcon sx={{ height: 36, width: 36 }} />
          <div>
            <p className="text-light-text-cl">{title}</p>
            <p className="text-xs">{project.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

type TTasksProps = {
  onClickSearchResult: (
    type: "task" | "phase" | "project",
    projectId: number,
    phaseId?: number,
    taskId?: number,
  ) => void
  searchResult: TGeneralSearchData
}

const Tasks = ({ onClickSearchResult, searchResult }: TTasksProps) => {
  return (
    <div className="mb-4">
      <h2 className="font-semibold mb-2 px-4">TASKS</h2>
      {searchResult.tasks.map(({ id, title, project, phase }) => (
        <div
          key={id}
          className="flex items-center gap-1 p-2 px-4 hover:bg-hover-silver-bgcl cursor-pointer"
          onClick={() => onClickSearchResult("task", project.id, phase.id, id)}
        >
          <AssignmentIcon sx={{ height: 36, width: 36 }} />
          <div>
            <p className="text-light-text-cl">{title}</p>
            <p className="text-xs">
              <span>{project.title}</span>
              <span>: </span>
              <span>{phase.title}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export const GeneralSearch = () => {
  const [startSearch, setStartSearch] = useState<boolean>(false)
  const debounce = useDebounce()
  const [searchResult, setSearchResult] = useState<TGeneralSearchData>()
  const [loading, setLoading] = useState<boolean>(false)
  const searchcContainerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const handleOnClickSearchResult = (
    type: "task" | "phase" | "project",
    projectId: number,
    phaseId?: number,
    taskId?: number,
  ) => {
    const options: NavigateOptions = {
      state: { [ENavigateStates.GENERAL_SEARCH_NAVIGATE]: true },
    }
    switch (type) {
      case "task":
        if (phaseId && taskId) {
          navigate(
            generateRouteWithParams(`/projects/${projectId}`, {
              [EQueryStringKeys.PHASE_ID]: `${phaseId}`,
              [EQueryStringKeys.TASK_ID]: `${taskId}`,
            }),
            options,
          )
        }
        break
      case "phase":
        if (phaseId) {
          navigate(
            generateRouteWithParams(`/projects/${projectId}`, {
              [EQueryStringKeys.PHASE_ID]: `${phaseId}`,
            }),
            options,
          )
        }
        break
      case "project":
        navigate(`/projects/${projectId}`, options)
        break
    }
    setStartSearch(false)
  }

  const handleSearch = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value
    if (keyword && keyword.length > 0) {
      setLoading(true)
      searchService
        .generalSearch(keyword)
        .then((res) => {
          setSearchResult(res)
        })
        .catch((error) => {
          toast.error(axiosErrorHandler.handleHttpError(error).message)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setSearchResult(undefined)
    }
  }, 400)

  const handleMouseClickOnPage = (e: MouseEvent) => {
    const inputEle = searchcContainerRef.current
    if (inputEle && !inputEle.contains(e.target as Node)) {
      setStartSearch(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleMouseClickOnPage)
    return () => {
      document.removeEventListener("mousedown", handleMouseClickOnPage)
    }
  }, [])

  const tasks = searchResult?.tasks
  const phases = searchResult?.phases
  const projects = searchResult?.projects

  return (
    <div className="relative h-full">
      <div
        ref={searchcContainerRef}
        className={`${startSearch ? "w-[550px] border-outline-cl" : "w-[250px] border-regular-border-cl"} z-20 transition-[width] absolute right-0 -translate-y-1/2 top-1/2 border text-regular-text-cl rounded bg-regular-bgcl mr-2`}
      >
        <input
          type="text"
          onFocus={() => setStartSearch(true)}
          onChange={handleSearch}
          className="text-regular-text-cl bg-transparent hover:bg-hover-silver-bgcl outline-none px-2 py-1 pr-10 text-sm w-full rounded"
          placeholder="Enter task, phase, project title..."
        />
        <SearchIcon
          className="absolute top-1/2 right-2 -translate-y-1/2"
          color="inherit"
          fontSize="small"
        />
        {startSearch && (
          <div className="text-sm pt-4 pb-2 absolute top-[calc(100%+10px)] border-divider-cl shadow border left-0 bg-modal-popover-bgcl w-full rounded max-h-[400px] overflow-auto css-styled-vt-scrollbar">
            {loading ? (
              <div className="flex flex-col justify-center items-center w-full h-[250px] text-regular-text-cl">
                <LogoLoading />
                <p className="mt-8">Searching...</p>
              </div>
            ) : tasks && phases && projects ? (
              tasks.length === 0 && phases.length === 0 && projects.length === 0 ? (
                <div className="flex flex-col justify-center items-center gap-1 px-10 h-[250px] w-full text-regular-text-cl">
                  <SearchOffIcon sx={{ height: 50, width: 50 }} color="inherit" />
                  <p className="text-base font-bold text-center">
                    We couldn't find anything matching your search.
                  </p>
                  <p className="text-sm text-center">Try again type task, phase, project title.</p>
                </div>
              ) : (
                <>
                  {searchResult.tasks.length > 0 && (
                    <Tasks
                      onClickSearchResult={handleOnClickSearchResult}
                      searchResult={searchResult}
                    />
                  )}
                  {searchResult.phases.length > 0 && (
                    <Phases
                      onClickSearchResult={handleOnClickSearchResult}
                      searchResult={searchResult}
                    />
                  )}
                  {searchResult.projects.length > 0 && (
                    <Projects
                      onClickSearchResult={handleOnClickSearchResult}
                      searchResult={searchResult}
                    />
                  )}
                </>
              )
            ) : (
              <div className="flex p-10 gap-2 flex-col justify-center items-center h-[250px] w-full text-regular-text-cl">
                <div className="flex gap-2">
                  <AssignmentIcon sx={{ height: 50, width: 50 }} color="inherit" />
                  <HomeRepairServiceIcon sx={{ height: 50, width: 50 }} color="inherit" />
                  <WorkIcon sx={{ height: 50, width: 50 }} color="inherit" />
                </div>
                <p className="text-base font-bold text-center">
                  Search your task, phase, project by typing title.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
