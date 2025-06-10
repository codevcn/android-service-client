import { MainBoard } from "./MainBoard"
import { LeftSideNavigation } from "./LeftSideNavigation"
import { TopNavigation } from "../TopNavigation"
import { Background } from "./Background"
import { useEffect } from "react"
import { projectService } from "../../services/project-service"
import { useAppDispatch } from "../../hooks/redux"
import { useUser } from "../../hooks/user"
import { setUserInProject } from "../../redux/user/user-slice"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../utils/axios-error-handler"
import { useParams } from "react-router-dom"
import { resetState, setProject, updateFetchedList } from "../../redux/project/project-slice"
import validator from "validator"
import type { TProjectPageParams } from "../../utils/types"

const ProjectPage = () => {
  const user = useUser()!
  const { projectId } = useParams<TProjectPageParams>()
  const dispatch = useAppDispatch()

  const fetchProjectData = (projectId: number) => {
    projectService
      .getProjectData(projectId)
      .then((res) => {
        dispatch(setProject(res))
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
      .finally(() => {
        dispatch(updateFetchedList({ type: "fetched", fetchedItems: ["project"] }))
      })
  }

  const fetchUserInfoInProject = (userId: number, projectId: number) => {
    projectService
      .getUserInfoInProject(userId, projectId)
      .then((res) => {
        dispatch(setUserInProject(res))
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
  }

  const resetData = () => {
    dispatch(resetState())
  }

  useEffect(() => {
    resetData()
    if (projectId) {
      fetchUserInfoInProject(user.id, parseInt(projectId))
      if (validator.isInt(projectId)) {
        fetchProjectData(parseInt(projectId))
      } else {
        toast.error("Project id must be an integer")
      }
    }
  }, [projectId])

  return (
    <div className="h-screen overflow-hidden relative bg-gradient-to-b from-purple-from-ligr to-pink-to-ligr">
      <TopNavigation />
      <Background />
      <div className="w-full h-background bg-cover relative z-20">
        <section className="flex h-full">
          {/* <LeftSideNavigation /> */}
          <MainBoard />
        </section>
      </div>
    </div>
  )
}

export default ProjectPage
