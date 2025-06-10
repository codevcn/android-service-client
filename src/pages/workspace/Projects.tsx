import StarIcon from "@mui/icons-material/Star"
import { useEffect, useMemo } from "react"
import { workspaceService } from "../../services/workspace-service"
import { useAppDispatch, useAppSelector } from "../../hooks/redux"
import { TProjectPreviewData } from "../../services/types"
import { setProjects } from "../../redux/workspace/workspace-slice"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../utils/axios-error-handler"
import { AllProjects, ProjectPreview } from "./AllProjects"
import { EInternalEvents, eventEmitter } from "../../utils/events"
import { JoinedProjects } from "./JoinedProjects"

type TStarredProjectsProps = {
  projects: TProjectPreviewData[]
}

const StarredProjects = ({ projects }: TStarredProjectsProps) => {
  const starredProjects = useMemo<TProjectPreviewData[]>(() => {
    return projects?.filter(({ starred }) => starred) || []
  }, [projects])

  return (
    starredProjects.length > 0 && (
      <section className="w-full">
        <a
          id="starred-projects-list"
          href="#starred-projects-list"
          className="flex items-center gap-2 mb-3"
        >
          <StarIcon fontSize="small" />
          <h2 className="text-lg font-semibold">Starred Boards</h2>
        </a>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {starredProjects.map((project) => (
            <ProjectPreview key={project.id} projectPreviewData={project} />
          ))}
        </div>
        <hr className="my-6" />
      </section>
    )
  )
}

export const Projects = () => {
  const { projects, filterResult } = useAppSelector(({ workspace }) => workspace)
  const dispatch = useAppDispatch()

  const fetchProjects = () => {
    workspaceService
      .getProjects()
      .then((res) => {
        dispatch(setProjects(res))
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
  }

  useEffect(() => {
    fetchProjects()
    eventEmitter.on(EInternalEvents.REFRESH_PROJECTS, () => {
      fetchProjects()
    })
    return () => {
      eventEmitter.off(EInternalEvents.REFRESH_PROJECTS)
    }
  }, [])

  const finalProjects = filterResult || projects

  return (
    <section className="w-full">
      {/* <StarredProjects projects={projects || []} /> */}
      <AllProjects filteredProjects={finalProjects} originalProjects={projects} />
      <JoinedProjects />
    </section>
  )
}
