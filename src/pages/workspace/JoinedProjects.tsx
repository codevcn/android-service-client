import { useEffect, useState } from "react"
import type { TProjectPreviewData } from "../../services/types"
import { projectService } from "../../services/project-service"
import { EInternalEvents, eventEmitter } from "../../utils/events"
import { SpaceDashboard } from "@mui/icons-material"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../utils/axios-error-handler"
import { ProjectPreview } from "./AllProjects"

export const JoinedProjects = () => {
  const [joinedProjects, setJoinedProjects] = useState<TProjectPreviewData[]>([])

  const fetchJoinedProjects = () => {
    projectService
      .getJoinedProjects()
      .then((projects) => {
        setJoinedProjects(projects)
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
  }

  useEffect(() => {
    fetchJoinedProjects()
    eventEmitter.on(EInternalEvents.REFRESH_JOINED_PROJECTS, () => {
      fetchJoinedProjects()
    })
    return () => {
      eventEmitter.off(EInternalEvents.REFRESH_JOINED_PROJECTS)
    }
  }, [])

  return (
    <section className="w-full">
      <hr className="my-6" />
      <a
        id="joined-projects-list"
        href="#joined-projects-list"
        className="flex items-center gap-2 mb-3"
      >
        <SpaceDashboard fontSize="small" />
        <h2 className="text-lg font-semibold">Joined Projects</h2>
      </a>
      {joinedProjects && joinedProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {joinedProjects.map((project) => (
            <ProjectPreview key={project.id} projectPreviewData={project} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <p className="text-gray-500 text-base">No joined projects</p>
        </div>
      )}
    </section>
  )
}
