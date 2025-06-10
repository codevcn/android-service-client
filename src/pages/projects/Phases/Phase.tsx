import { FocusEvent, KeyboardEvent, useEffect, useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useAppDispatch } from "../../../hooks/redux"
import { updateSinglePhase } from "../../../redux/project/project-slice"
import type { TPhaseData } from "../../../services/types"
import { styled, TextField } from "@mui/material"
import { TaskPreviews } from "./TaskPreviews"
import { EInternalEvents, eventEmitter } from "../../../utils/events"
import { checkUserPermission } from "../../../configs/user-permissions"
import { useUserInProject } from "../../../hooks/user"
import { PhaseMenu } from "./PhaseMenu"
import { phaseService } from "../../../services/phase-service"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../../utils/axios-error-handler"

type TPhaseProps = {
  phaseData: TPhaseData
  className?: string
  projectId: number
}

export const Phase = ({ phaseData, className, projectId }: TPhaseProps) => {
  const { taskPreviews, title, id } = phaseData
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const dispatch = useAppDispatch()
  const [cssClass, setCssClass] = useState<string>("")
  const userInProject = useUserInProject()!

  const quitEditing = (newTitle: string) => {
    if (newTitle && newTitle.length > 0) {
      phaseService
        .updatePhase(
          projectId,
          {
            id: phaseData.id,
            title: newTitle,
            description: phaseData.description || "",
            position: phaseData.position,
            taskPreviews,
          },
          projectId,
        )
        .then((res) => {
          dispatch(updateSinglePhase({ ...phaseData, ...res }))
        })
        .catch((err) => {
          toast.error(axiosErrorHandler.handleHttpError(err).message)
        })
    }
  }

  const catchEditingEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const input = e.target as HTMLTextAreaElement
      input.blur()
      quitEditing(input.value || title)
    }
  }

  const blurListTitleInput = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    quitEditing((e.target as HTMLTextAreaElement).value || title)
  }

  useEffect(() => {
    eventEmitter.on(EInternalEvents.DRAGGING_TASK_IN_PHASE, (payload, type) => {
      if (payload === id) {
        if (type === "start-dragging") {
          setCssClass("outline outline-2 outline-outline-cl")
        } else {
          setCssClass("")
        }
      }
    })
    return () => {
      eventEmitter.off(EInternalEvents.DRAGGING_TASK_IN_PHASE)
    }
  }, [])

  return (
    <div
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div
        className={`${className} ${cssClass} ${`Top-Phase-Container-${id}`} flex flex-col relative m-0 h-fit max-h-full z-20 text-regular-text-cl bg-phase-bgcl w-[272px] rounded-xl`}
      >
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          className="flex justify-between text-[#B6C2CF] gap-x-2 p-2 pb-1 cursor-grab active:cursor-grabbing"
        >
          <div className="w-full">
            <EditableTitle
              multiline
              maxRows={5}
              defaultValue={title}
              onKeyDown={catchEditingEnter}
              variant="outlined"
              onBlur={blurListTitleInput}
              onMouseDown={(e) => e.stopPropagation()}
              sx={{
                pointerEvents: checkUserPermission(userInProject.projectRole, "CRUD-phase")
                  ? "auto"
                  : "none",
              }}
            />
          </div>
          <PhaseMenu phaseData={phaseData} />
        </div>
        <TaskPreviews phaseData={phaseData} taskPreviews={taskPreviews || []} />
      </div>
    </div>
  )
}

const EditableTitle = styled(TextField)({
  "& .MuiInputBase-formControl": {
    width: "100%",
    padding: "5px 8px",
    "& .MuiInputBase-input": {
      width: "100%",
      color: "var(--ht-regular-text-cl)",
      fontWeight: 700,
      fontSize: "1.1rem",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
    },
    "&:hover": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "transparent",
      },
    },
    "&.Mui-focused": {
      backgroundColor: "var(--ht-focused-textfield-bgcl)",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "var(--ht-outline-cl)",
      },
    },
  },
})
