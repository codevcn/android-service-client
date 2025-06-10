//>>> removed useCallback at function "moveTaskHandler"
import { styled, Popover, Select, MenuItem, SelectChangeEvent, FormControl } from "@mui/material"
import { useEffect, useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import { moveTask } from "../../../redux/project/project-slice"
import type { TPhaseData, TTaskPreviewData } from "../../../services/types"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { taskService } from "../../../services/task-service"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../../utils/axios-error-handler"
import { LogoLoading } from "../../../components/Loadings"
import { TTaskDataState } from "../../../utils/types"

type TPositionsToMove = {
  taskPreviews: TTaskPreviewData[]
  toPhaseId: number
}

type TPhasesToMoveProps = {
  phases: TPhaseData[]
  toPhase: TPhaseData
}

type TMoveTaskFormData = {
  toPhase: TPhaseData | undefined
  toPosition: number | undefined
}

type TMoveTaskProps = {
  taskData: TTaskDataState
  phaseId: number
}

export const MoveTask = ({ taskData, phaseId }: TMoveTaskProps) => {
  const { id: taskId } = taskData
  const phases = useAppSelector(({ project }) => project.phases)
  const [anchorEle, setAnchorEle] = useState<HTMLElement | null>(null)
  const [moveTo, setMoveTo] = useState<TMoveTaskFormData>({
    toPhase: undefined,
    toPosition: undefined,
  })
  const [phaseData, setPhaseData] = useState<TPhaseData>()
  const dispatch = useAppDispatch()
  const [isMoving, setIsMoving] = useState<boolean>(false)
  const [taskPositionInPhase, setTaskPositionInPhase] = useState<number>()
  const project = useAppSelector((state) => state.project.project!)

  const { toPhase, toPosition } = moveTo

  const initMoveToData = () => {
    const phase = phases?.find(({ id }) => id === phaseId)
    if (phase) {
      setPhaseData(phase)
      const toPosition = phase.taskPreviews?.find(({ id }) => id === taskId)?.position
      setMoveTo({ toPosition, toPhase: phase })
      setTaskPositionInPhase(toPosition)
    }
  }

  useEffect(() => {
    initMoveToData()
  }, [phases, phaseId])

  const moveTaskHandler = () => {
    const { toPhase, toPosition } = moveTo
    if (toPhase && (toPosition || toPosition === 0)) {
      setIsMoving(true)
      taskService
        .moveTask(taskId, toPhase.id, toPosition, project.id)
        .then(() => {
          setAnchorEle(null)
          dispatch(moveTask({ fromPhaseId: phaseId, taskId, toPhaseId: toPhase.id, toPosition }))
        })
        .catch((error) => {
          toast.error(axiosErrorHandler.handleHttpError(error).message)
        })
        .finally(() => {
          setIsMoving(false)
        })
    }
  }

  const handleOpen = (e?: React.MouseEvent<HTMLSpanElement>) => {
    if (e) {
      setAnchorEle(e.currentTarget)
    } else {
      setAnchorEle(null)
    }
  }

  const onChangePhaseToMove = (e: SelectChangeEvent<unknown>, phases: TPhaseData[]) => {
    const phaseId = parseInt(e.target.value as string)
    const toPhase = phases.find(({ id }) => id === phaseId)!
    const toPosition = (toPhase.taskPreviews?.[0]?.position || 1) - 1
    setMoveTo({ toPosition, toPhase })
    setTaskPositionInPhase(toPosition)
  }

  const onChangePositionToMove = (e: SelectChangeEvent<unknown>) => {
    setMoveTo((pre) => ({ ...pre, toPosition: parseInt(e.target.value as string) }))
  }

  const PhasesToMove = ({ toPhase, phases }: TPhasesToMoveProps) => {
    return (
      <div className="grow">
        <h3 className="mb-0.5 pl-1 font-semibold">Phase</h3>
        <FormControl fullWidth>
          <StyledSelect
            size="small"
            value={toPhase.id}
            onChange={(e) => onChangePhaseToMove(e, phases)}
            MenuProps={{
              MenuListProps: {
                className: "bg-modal-popover-bgcl bor border border-regular-border-cl",
              },
            }}
          >
            {phases.map(({ id, title }) => (
              <StyledMenuItem key={id} value={id}>
                {title}
              </StyledMenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      </div>
    )
  }

  const PositionsToMove = ({ taskPreviews, toPhaseId }: TPositionsToMove) => {
    const taskPreviewsCount = taskPreviews.length
    return (
      <div className="w-[78px]">
        <h3 className="mb-0.5 pl-1 font-semibold">Position</h3>
        <FormControl fullWidth>
          <StyledSelect
            size="small"
            value={toPosition}
            onChange={onChangePositionToMove}
            MenuProps={{
              MenuListProps: {
                className: "bg-modal-popover-bgcl w-[112px] border border-regular-border-cl",
              },
            }}
          >
            {taskPreviewsCount > 0 &&
              taskPreviews.map(({ id, position }) => (
                <StyledMenuItem key={id} value={position}>
                  <span>{`${position + 1}${taskPositionInPhase === position ? " (current)" : ""}`}</span>
                </StyledMenuItem>
              ))}
            {taskPreviewsCount > 0 && phaseId !== toPhaseId && (
              <StyledMenuItem value={taskPreviewsCount}>
                <span>{taskPreviewsCount + 1}</span>
              </StyledMenuItem>
            )}
            {taskPreviewsCount === 0 && (
              <StyledMenuItem value={0}>
                <span>1</span>
              </StyledMenuItem>
            )}
          </StyledSelect>
        </FormControl>
      </div>
    )
  }

  return phases && phases.length > 0 && phaseData && toPhase && (toPosition || toPosition === 0) ? (
    <>
      <div className="flex items-center gap-1 text-regular-text-cl text-xs mt-1">
        <span className="ml-10">In Phase</span>
        <button
          onClick={handleOpen}
          className="flex gap-x-1 p-1 font-semibold rounded bg-modal-btn-bgcl hover:bg-modal-btn-hover-bgcl cursor-pointer"
        >
          <span>{phaseData.title}</span>
          <ExpandMoreIcon sx={{ height: 14, width: 14, transform: "scale(1.3)" }} />
        </button>
      </div>

      <StyledPopover
        open={!!anchorEle}
        anchorEl={anchorEle}
        onClose={() => handleOpen()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <div className="bg-modal-popover-bgcl rounded-md p-3 text-regular-text-cl w-[300px] text-sm">
          <header className="relative w-full py-1">
            <h3 className="w-full text-center text-sm font-bold">Move Task</h3>
            <button
              onClick={() => handleOpen()}
              className="flex absolute right-0 top-0 p-1 rounded-md hover:bg-modal-btn-hover-bgcl"
            >
              <CloseIcon className="text-regular-text-cl" fontSize="small" />
            </button>
          </header>
          <h2 className="mt-3 w-fit">Select destination</h2>
          <div className="w-full mt-2">
            <div className="flex items-center gap-3">
              <PhasesToMove phases={phases} toPhase={toPhase} />
              <PositionsToMove taskPreviews={toPhase.taskPreviews || []} toPhaseId={toPhase.id} />
            </div>
            <button
              disabled={isMoving}
              onClick={moveTaskHandler}
              type="submit"
              className="rounded py-1.5 text-black mt-2 px-4 bg-confirm-btn-bgcl hover:bg-confirm-btn-hover-bgcl"
            >
              {isMoving ? (
                <div className="flex h-5 w-full">
                  <LogoLoading className="m-auto" color="black" size="small" />
                </div>
              ) : (
                <span>Move</span>
              )}
            </button>
          </div>
        </div>
      </StyledPopover>
    </>
  ) : (
    <span></span>
  )
}

const StyledPopover = styled(Popover)({
  "& .MuiPaper-root": {
    borderRadius: 6,
    backgroundColor: "var(--ht-modal-popover-bgcl)",
    border: "1px var(--ht-regular-border-cl) solid",
  },
})

const StyledSelect = styled(Select)({
  fontSize: "15px",
  color: "var(--ht-modal-text-cl)",
  "& svg": {
    fill: "var(--ht-modal-text-cl)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--ht-regular-border-cl)",
  },
  "&.Mui-focused": {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--ht-outline-cl)",
    },
  },
  "&:hover": {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--ht-outline-cl)",
    },
  },
})

const StyledMenuItem = styled(MenuItem)({
  color: "var(--ht-regular-text-cl)",
  "&:hover": {
    backgroundColor: "var(--ht-modal-btn-hover-bgcl)",
  },
  "&.Mui-selected": {
    fontWeight: "bold",
    color: "var(--ht-selected-text-cl)",
    backgroundColor: "#3299ff24",
  },
})
