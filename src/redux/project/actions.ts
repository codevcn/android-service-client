import { toast } from "react-toastify"
import type { TTaskMemberData } from "../../services/types"
import type { TAppDispatch, TGetState } from "../store"
import { addNewTaskMember } from "./project-slice"
import { taskService } from "../../services/task-service"
import axiosErrorHandler from "../../utils/axios-error-handler"

export const addNewTaskMemberAction =
  (memberData: TTaskMemberData, phaseId: number, taskId: number, projectId: number) =>
  (dispatch: TAppDispatch, getState: TGetState) => {
    const taskMemberId = memberData.id
    const currentMembers = getState().project.taskData?.members
    if (currentMembers && currentMembers.length > 0) {
      if (currentMembers.some((member) => member.id === taskMemberId)) {
        toast.error("User's already been assigned to this task")
        return
      }
    }
    taskService
      .addMemberToATask(taskId, taskMemberId, projectId)
      .then(() => {
        dispatch(addNewTaskMember({ taskMemberData: memberData, phaseId, taskId }))
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
  }
