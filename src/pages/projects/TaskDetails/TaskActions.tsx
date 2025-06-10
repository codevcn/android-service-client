import { styled, Tooltip, Popover } from "@mui/material"
import { useState } from "react"
import { EInternalEvents, eventEmitter } from "../../../utils/events"
import CloseIcon from "@mui/icons-material/Close"
import { toast } from "react-toastify"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import { deleteTask, updateTaskPreview, updateTaskData } from "../../../redux/project/project-slice"
import DeleteIcon from "@mui/icons-material/Delete"
import { useUserInProject } from "../../../hooks/user"
import { checkUserPermission } from "../../../configs/user-permissions"
import type { TPhaseData, TTaskData } from "../../../services/types"
import { taskService } from "../../../services/task-service"
import axiosErrorHandler from "../../../utils/axios-error-handler"
import { LogoLoading } from "../../../components/Loadings"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { TTaskStatus } from "../../../utils/types"
import CancelIcon from "@mui/icons-material/Cancel"

type TLoadings = "delete-task" | "mark-as-complete"

type TTaskActionsProps = {
  phaseData: TPhaseData
  taskData: TTaskData
}

export const TaskActions = ({ phaseData, taskData }: TTaskActionsProps) => {
  const phaseId = phaseData.id
  const taskId = taskData.id
  const isComplete = taskData.status === "complete"
  const [anchorEle, setAnchorEle] = useState<HTMLButtonElement | null>(null)
  const dispatch = useAppDispatch()
  const userInProject = useUserInProject()!
  const [loading, setLoading] = useState<TLoadings>()
  const project = useAppSelector((state) => state.project.project!)

  const handleOpenDeleteTaskBoard = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      setAnchorEle(e.currentTarget)
    } else {
      setAnchorEle(null)
    }
  }

  const deleteTaskHandler = () => {
    setLoading("delete-task")
    taskService
      .deleteTask(taskId, project.id)
      .then(() => {
        toast.success("Deleted task successfully!")
        dispatch(deleteTask({ phaseId, taskId }))
        eventEmitter.emit(EInternalEvents.OPEN_TASK_DETAILS_MODAL, false, taskId)
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
      .finally(() => {
        setLoading(undefined)
      })
  }

  const markTaskAsComplete = () => {
    setLoading("mark-as-complete")
    const newStatus: TTaskStatus = isComplete ? "uncomplete" : "complete"
    taskService
      .handleMarkTaskComplete(taskId, newStatus, project.id)
      .then(() => {
        toast.success("Task is marked as complete")
        dispatch(updateTaskData({ status: newStatus }))
        dispatch(updateTaskPreview({ ...taskData, status: newStatus, phaseId }))
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
      .finally(() => {
        setLoading(undefined)
      })
  }

  const isPermitted = checkUserPermission(userInProject.projectRole, "CRUD-task")

  return (
    <>
      <h3 className="text-xs mt-5">Task actions</h3>
      <div className="flex flex-col gap-y-2 mt-1">
        {isPermitted && (
          <Tooltip title="Delete this task" arrow placement="left">
            <button
              onClick={handleOpenDeleteTaskBoard}
              className="flex items-center gap-x-2 text-black py-[6px] px-3 bg-delete-btn-bgcl rounded hover:bg-delete-btn-hover-bgcl"
            >
              {loading === "delete-task" ? (
                <div className="flex h-5 w-full">
                  <LogoLoading className="m-auto" color="black" size="small" />
                </div>
              ) : (
                <>
                  <DeleteIcon fontSize="small" color="inherit" />
                  <span className="font-bold text-sm">Delete</span>
                </>
              )}
            </button>
          </Tooltip>
        )}
        <Tooltip title="Mark task as complete" arrow placement="left">
          <button
            onClick={markTaskAsComplete}
            className={`${isComplete ? "bg-delete-btn-bgcl hover:bg-delete-btn-hover-bgcl" : "bg-success-text-cl"} flex items-center gap-x-2 py-[6px] px-3 text-black rounded`}
          >
            {loading === "mark-as-complete" ? (
              <div className="flex h-5 w-full">
                <LogoLoading className="m-auto" color="black" size="small" />
              </div>
            ) : isComplete ? (
              <>
                <CancelIcon fontSize="small" color="inherit" />
                <span className="font-bold text-sm">Mark as uncomplete</span>
              </>
            ) : (
              <>
                <CheckCircleIcon fontSize="small" color="inherit" />
                <span className="font-bold text-sm">Mark as complete</span>
              </>
            )}
          </button>
        </Tooltip>
      </div>

      <StyledPopover
        open={!!anchorEle}
        anchorEl={anchorEle}
        onClose={() => handleOpenDeleteTaskBoard()}
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
            <h3 className="w-full text-center text-sm font-bold">Delete task</h3>
            <button
              onClick={() => handleOpenDeleteTaskBoard()}
              className="flex absolute right-0 top-0 p-1 rounded-md hover:bg-modal-btn-hover-bgcl"
            >
              <CloseIcon className="text-regular-text-cl" fontSize="small" />
            </button>
          </div>
          <p className="text-sm mt-2">Deleting a task is forever. There is no undo.</p>
          <button
            onClick={deleteTaskHandler}
            className="text-sm mt-2 bg-delete-btn-bgcl rounded-md p-1 w-full text-black font-bold hover:bg-delete-btn-hover-bgcl"
          >
            Delete task
          </button>
        </div>
      </StyledPopover>
    </>
  )
}

const StyledPopover = styled(Popover)({
  "& .MuiPaper-root": {
    borderRadius: 6,
    backgroundColor: "var(--ht-modal-popover-bgcl)",
    border: "1px var(--ht-regular-border-cl) solid",
  },
})
