import { Tooltip } from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import { removeTaskMember } from "../../../redux/project/project-slice"
import GroupRemoveIcon from "@mui/icons-material/GroupRemove"
import GroupAddIcon from "@mui/icons-material/GroupAdd"
import GroupsIcon from "@mui/icons-material/Groups"
import { checkIfUserInTaskSelector } from "../../../redux/project/selectors"
import { useUserInProject } from "../../../hooks/user"
import { addNewTaskMemberAction } from "../../../redux/project/actions"
import type { TTaskData } from "../../../services/types"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import { EInternalEvents, eventEmitter } from "../../../utils/events"
import { taskService } from "../../../services/task-service"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../../utils/axios-error-handler"
import { checkUserPermission } from "../../../configs/user-permissions"

type TUserActionsProps = {
  phaseId: number
  taskData: TTaskData
  projectId: number
}

export const UserActions = ({ phaseId, taskData, projectId }: TUserActionsProps) => {
  const { id } = taskData
  const userInProject = useUserInProject()!
  const isUserInTask = useAppSelector(checkIfUserInTaskSelector(userInProject.id))
  const dispatch = useAppDispatch()

  const joinTask = () => {
    dispatch(addNewTaskMemberAction(userInProject, phaseId, id, projectId))
  }

  const leaveTask = () => {
    taskService
      .removeMemberFromATask(id, userInProject.id)
      .then(() => {
        dispatch(removeTaskMember({ memberId: userInProject.id, phaseId, taskId: id }))
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
  }

  const handleOpenAddMemberBoard = (e: React.MouseEvent<HTMLButtonElement>) => {
    eventEmitter.emit(EInternalEvents.OPEN_ADD_TASK_MEMBERS_BOARD, {
      anchorEle: e.currentTarget,
      phaseId,
      taskId: taskData.id,
      projectId,
      anchorOrigin: { horizontal: "right", vertical: "bottom" },
      transformOrigin: { horizontal: "right", vertical: "top" },
    })
  }

  const openDueDatesBoard = (e: React.MouseEvent<HTMLButtonElement>) => {
    eventEmitter.emit(EInternalEvents.OPEN_TASK_DATES_BOARD, {
      anchorEle: e.currentTarget,
    })
  }

  return (
    <>
      <h3 className="text-xs">User actions</h3>
      <div className="flex flex-col gap-y-2 mt-1">
        {isUserInTask ? (
          <Tooltip title="Leave this task" arrow placement="left">
            <button
              onClick={leaveTask}
              className="flex items-center gap-x-2 font-medium text-sm py-[6px] px-3 bg-modal-btn-bgcl rounded hover:bg-modal-btn-hover-bgcl"
            >
              <GroupRemoveIcon fontSize="small" />
              <span>Leave</span>
            </button>
          </Tooltip>
        ) : (
          <Tooltip title="Join this task" arrow placement="left">
            <button
              onClick={joinTask}
              className="flex items-center gap-x-2 font-medium text-sm py-[6px] px-3 bg-modal-btn-bgcl rounded hover:bg-modal-btn-hover-bgcl"
            >
              <GroupAddIcon fontSize="small" />
              <span>Join</span>
            </button>
          </Tooltip>
        )}
        <Tooltip title="View members of this task" arrow placement="left">
          <button
            onClick={handleOpenAddMemberBoard}
            className="flex items-center gap-x-2 font-medium text-sm py-[6px] px-3 bg-modal-btn-bgcl rounded hover:bg-modal-btn-hover-bgcl"
          >
            <GroupsIcon fontSize="small" />
            <span>Members</span>
          </button>
        </Tooltip>
        {/* {checkUserPermission(userInProject.projectRole, "assign-due-date") && (
          <Tooltip title="Set deadline for this task" arrow placement="left">
            <button
              onClick={openDueDatesBoard}
              className="flex items-center gap-x-2 font-medium text-sm py-[6px] px-3 bg-modal-btn-bgcl rounded hover:bg-modal-btn-hover-bgcl"
            >
              <AccessTimeIcon fontSize="small" />
              <span>Dates</span>
            </button>
          </Tooltip>
        )} */}
      </div>
    </>
  )
}
