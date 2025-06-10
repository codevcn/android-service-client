/**
 * orderIndex: 0 -> 1 -> 2 -> 3 -> 4 -> ... (bắt đầu từ 0)
 */

import { Avatar, styled, TextField, Tooltip, AvatarGroup } from "@mui/material"
import type { TPhaseData, TTaskPreviewData } from "../../../services/types"
import ReorderIcon from "@mui/icons-material/Reorder"
import AddIcon from "@mui/icons-material/Add"
import { KeyboardEvent, useMemo, useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import {
  addNewTaskPreview,
  updateSinglePhase,
  updateTaskData,
  updateTaskPreview,
} from "../../../redux/project/project-slice"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Active,
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  Over,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { EInternalEvents, eventEmitter } from "../../../utils/events"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../../utils/axios-error-handler"
import type { TTaskStatus } from "../../../utils/types"
import { taskService } from "../../../services/task-service"

type TTaskPreviewProps = {
  taskPreviewData: TTaskPreviewData
  className?: string
  phaseData: TPhaseData
}

const Task = ({ taskPreviewData, className, phaseData }: TTaskPreviewProps) => {
  const phaseId = phaseData.id
  const { id, taskMembers, hasDescription, title, status } = taskPreviewData
  const isComplete = status === "complete"
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const dispatch = useAppDispatch()
  const project = useAppSelector(({ project }) => project.project!)

  const openTaskDetails = () => {
    eventEmitter.emit(EInternalEvents.OPEN_TASK_DETAILS_MODAL, true, id)
  }

  const handleMarkAsComplete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    const newStatus: TTaskStatus = status === "complete" ? "uncomplete" : "complete"
    taskService
      .handleMarkTaskComplete(id, newStatus, project.id)
      .then(() => {
        dispatch(updateTaskPreview({ ...taskPreviewData, phaseId, status: newStatus }))
        dispatch(updateTaskData({ status: newStatus }))
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <div
        className={`${className || ""} group/root bg-focused-textfield-bgcl cursor-pointer mb-2 rounded-lg py-2 px-3 pr-2 hover:outline outline-2 outline-white`}
        onClick={openTaskDetails}
      >
        <div className="flex">
          <Tooltip title="Mark as complete" placement="left" arrow>
            <button
              onClick={(e) => handleMarkAsComplete(e)}
              className={`${isComplete ? "min-w-5 mr-1.5" : "group-hover/root:min-w-5 group-hover/root:mr-1.5"} group/icon-btn flex min-w-0 w-0 overflow-x-hidden transition-[min-width]`}
            >
              {isComplete ? (
                <CheckCircleIcon
                  fontSize="small"
                  sx={{ height: 20, width: 20 }}
                  className="text-success-text-cl"
                />
              ) : (
                <RadioButtonUncheckedIcon
                  fontSize="small"
                  sx={{ height: 20, width: 20 }}
                  className="group-hover/icon-btn:fill-success-text-cl"
                />
              )}
            </button>
          </Tooltip>
          <h3 className={`${isComplete ? "line-through" : ""} flex text-sm grow break-words`}>
            {title}
          </h3>
        </div>
        <div className="flex items-center justify-between mt-2">
          {hasDescription && (
            <Tooltip title="This card has a description." arrow>
              <div>
                <ReorderIcon sx={{ fontSize: 16 }} />
              </div>
            </Tooltip>
          )}
          <StyledAvatarGroup max={3}>
            {taskMembers &&
              taskMembers.length > 0 &&
              taskMembers.map(({ fullName, avatar, id }) => (
                <button className="h-fit w-fit" key={id}>
                  <Tooltip title={fullName} arrow>
                    {avatar ? (
                      <Avatar alt="User Avatar" src={avatar} sx={{ height: 24, width: 24 }} />
                    ) : (
                      <Avatar alt="User Avatar" sx={{ height: 24, width: 24 }}>
                        {fullName[0]}
                      </Avatar>
                    )}
                  </Tooltip>
                </button>
              ))}
          </StyledAvatarGroup>
        </div>
      </div>
    </div>
  )
}

type TAddNewTaskProps = {
  phaseData: TPhaseData
  finalTaskPosition: number | null
}

const AddNewTask = ({ phaseData, finalTaskPosition }: TAddNewTaskProps) => {
  const phaseId = phaseData.id
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const project = useAppSelector(({ project }) => project.project!)

  const handleAddNewTask = (title?: string) => {
    if (title && title.length > 0) {
      taskService
        .createNewTask(phaseId, title, finalTaskPosition ? finalTaskPosition + 1 : 0, project.id)
        .then((res) => {
          dispatch(
            addNewTaskPreview({
              id: res.id,
              title,
              taskMembers: null,
              hasDescription: false,
              phaseId,
              position: res.position,
              status: "uncomplete",
              dueDate: null,
            }),
          )
        })
    }
    setIsAdding(false)
  }

  const submitAdding = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    handleAddNewTask(formData.get("title") as string)
  }

  const catchAddingEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddNewTask((e.target as HTMLTextAreaElement).value)
    }
  }

  return (
    <div className="p-2">
      {isAdding ? (
        <form onSubmit={submitAdding} className="p-1 rounded-md bg-focused-textfield-bgcl">
          <EditableTitle
            multiline
            maxRows={5}
            variant="outlined"
            placeholder="Enter a title..."
            autoFocus
            onKeyDown={catchAddingEnter}
            name="title"
          />
          <div className="flex mt-3 gap-x-2">
            <button
              type="submit"
              className="py-[6px] px-3 leading-none border-none rounded bg-confirm-btn-bgcl text-[#1D2125] font-medium text-sm"
            >
              Add Task
            </button>
            <Tooltip title="Cancel adding new card.">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="hover:bg-hover-silver-bgcl px-1 py-1 rounded"
              >
                <CloseIcon />
              </button>
            </Tooltip>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center w-full gap-x-2 p-1 bg-transparent border-none cursor-pointer hover:bg-[#282F27] rounded-md"
        >
          <AddIcon fontSize="small" />
          <span className="text-sm">Add a task</span>
        </button>
      )}
    </div>
  )
}

type TOverlayItemProps = {
  taskPreviewData: TTaskPreviewData
}

const OverlayItem = ({ taskPreviewData }: TOverlayItemProps) => {
  const { taskMembers, hasDescription, title } = taskPreviewData
  const firstMember = taskMembers?.at(0)

  return (
    <div className="bg-focused-textfield-bgcl cursor-pointer mb-2 rounded-lg py-2 px-3 pr-2 opacity-60 rotate-12">
      <h3 className="text-sm">{title}</h3>
      <div className="flex items-center justify-between mt-2">
        {hasDescription && (
          <Tooltip title="This card has a description." arrow>
            <div>
              <ReorderIcon sx={{ fontSize: 16 }} />
            </div>
          </Tooltip>
        )}
        {firstMember && (
          <div>
            <Tooltip title={firstMember.fullName} arrow>
              {firstMember.avatar ? (
                <Avatar alt="User Avatar" src={firstMember.avatar} sx={{ height: 24, width: 24 }} />
              ) : (
                <Avatar sx={{ height: 24, width: 24 }}>{firstMember.fullName[0]}</Avatar>
              )}
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}

type TTaskPreviewsProps = {
  phaseData: TPhaseData
  taskPreviews: TTaskPreviewData[]
}

export const TaskPreviews = ({ taskPreviews, phaseData }: TTaskPreviewsProps) => {
  const phaseId = phaseData.id
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 400, // Thời gian giữ chuột (ms)
        tolerance: 5, // Số pixel di chuyển tối đa trước khi kích hoạt drag
      },
    }),
    useSensor(TouchSensor),
  )
  const dispatch = useAppDispatch()
  const dndItems: TTaskPreviewData["id"][] = taskPreviews.map((task) => task.id)
  const project = useAppSelector((state) => state.project.project!)

  const handleDragStart = (e: DragStartEvent) => {
    setDraggingId(e.active.id as number)
    eventEmitter.emit(EInternalEvents.DRAGGING_TASK_IN_PHASE, phaseId, "start-dragging")
  }

  const moveTaskHandler = (active: Active, over: Over) => {
    dispatch((dispatch, getState) => {
      const preTaskPreviews = getState().project.phases?.find(
        (phase) => phase.id === phaseId,
      )?.taskPreviews
      if (preTaskPreviews && preTaskPreviews.length > 0) {
        const fromIndex = preTaskPreviews.findIndex((task) => task.id === active.id)
        const toIndex = preTaskPreviews.findIndex((task) => task.id === over.id)
        dispatch(
          updateSinglePhase({
            id: phaseId,
            taskPreviews: arrayMove(preTaskPreviews, fromIndex, toIndex),
          }),
        )
        taskService
          .moveTask(parseInt(active.id.toString()), phaseId, toIndex, project.id)
          .catch((error) => {
            toast.error(axiosErrorHandler.handleHttpError(error).message)
            dispatch(
              updateSinglePhase({
                id: phaseId,
                taskPreviews: preTaskPreviews,
              }),
            )
          })
      }
    })
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (over) {
      if (active.id !== over.id) {
        moveTaskHandler(active, over)
      }
    }
    setDraggingId(null)
    eventEmitter.emit(EInternalEvents.DRAGGING_TASK_IN_PHASE, phaseId, "end-dragging")
  }

  const handleDragCancel = () => {
    setDraggingId(null)
    eventEmitter.emit(EInternalEvents.DRAGGING_TASK_IN_PHASE, phaseId, "end-dragging")
  }

  const sortedDndItems = useMemo<TTaskPreviewData[]>(() => {
    if (dndItems && dndItems.length > 0 && taskPreviews && taskPreviews.length > 0) {
      return dndItems.map((item) => taskPreviews.find((task) => task.id === item)!)
    }
    return []
  }, [dndItems])

  const findTaskPreview = (taskPreviews: TTaskPreviewData[], taskId: number): TTaskPreviewData => {
    return taskPreviews.find((task) => task.id === taskId)!
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={dndItems} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col flex-[1_1_auto] css-tasks-styled-scrollbar overflow-y-auto min-h-[70px] py-1 px-2">
            {sortedDndItems && sortedDndItems.length > 0 ? (
              sortedDndItems.map((task) => (
                <Task
                  key={task.id}
                  taskPreviewData={task}
                  className={draggingId === task.id ? "opacity-0" : "opacity-100"}
                  phaseData={phaseData}
                />
              ))
            ) : (
              <div className="text-regular-text-cl w-full text-center m-auto h-fit leading-tight">
                This phase has no task now.
              </div>
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {draggingId ? (
            <OverlayItem taskPreviewData={findTaskPreview(sortedDndItems, draggingId)} />
          ) : null}
        </DragOverlay>
      </DndContext>
      <AddNewTask
        phaseData={phaseData}
        finalTaskPosition={sortedDndItems[sortedDndItems.length - 1]?.position || null}
      />
    </>
  )
}

const StyledAvatarGroup = styled(AvatarGroup)({
  "& .MuiAvatarGroup-avatar": {
    cursor: "pointer",
    height: 28,
    width: 28,
    border: "none",
  },
})

const EditableTitle = styled(TextField)({
  width: "100%",
  "& .MuiInputBase-formControl": {
    width: "100%",
    padding: "5px 8px",
    "& .MuiInputBase-input": {
      width: "100%",
      color: "var(--ht-regular-text-cl)",
      fontWeight: 500,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
    },
  },
})
