import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import { copyPhase, deletePhase, movePhase } from "../../../redux/project/project-slice"
import type { TPhaseData } from "../../../services/types"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import {
  Dialog,
  DialogContent,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  Tooltip,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { EInternalEvents, eventEmitter } from "../../../utils/events"
import { Fade, Popover } from "@mui/material"
import { phaseService } from "../../../services/phase-service"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../../utils/axios-error-handler"
import { openFixedLoadingHandler } from "../../../utils/helpers"
import SubtitlesIcon from "@mui/icons-material/Subtitles"
import { LogoLoading } from "../../../components/Loadings"
import OpenWithIcon from "@mui/icons-material/OpenWith"

type TDeletePhaseActionProps = {
  phaseId: number
}

const DeletePhaseAction = ({ phaseId }: TDeletePhaseActionProps) => {
  const [anchorEle, setAnchorEle] = useState<HTMLElement>()
  const dispatch = useAppDispatch()

  const handleOpen = (e?: React.MouseEvent<HTMLElement>) => {
    if (e) {
      setAnchorEle(e.currentTarget)
    } else {
      setAnchorEle(undefined)
    }
  }

  const deletePhaseHandler = () => {
    openFixedLoadingHandler(true)
    phaseService
      .deletePhase(phaseId)
      .then(() => {
        dispatch(deletePhase(phaseId))
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
      .finally(() => {
        openFixedLoadingHandler(false)
      })
  }

  return (
    <>
      <li
        onClick={handleOpen}
        className="cursor-pointer hover:bg-hover-silver-bgcl py-[6px] px-3 text-regular-text-cl text-sm font-medium"
      >
        Delete phase
      </li>

      <StyledPopover
        anchorEl={anchorEle}
        open={!!anchorEle}
        onClose={() => handleOpen()}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div className="bg-modal-popover-bgcl border border-solid border-regular-border-cl rounded-lg p-3 text-regular-text-cl w-[300px]">
          <div className="relative w-full py-1">
            <h3 className="w-full text-center text-sm font-bold">Delete phase</h3>
            <button
              onClick={() => handleOpen()}
              className="flex absolute right-0 top-0 p-1 rounded-md hover:bg-modal-btn-hover-bgcl"
            >
              <CloseIcon className="text-regular-text-cl" fontSize="small" />
            </button>
          </div>
          <p className="text-sm mt-2">
            Deleting a phase will delete all tasks in the phase. Deleting a phase is forever, there
            is no undo.
          </p>
          <button
            onClick={deletePhaseHandler}
            className="text-sm mt-2 bg-delete-btn-bgcl rounded-md p-1 w-full text-black font-bold hover:bg-delete-btn-hover-bgcl"
          >
            Delete phase
          </button>
        </div>
      </StyledPopover>
    </>
  )
}

type TCopyPhaseActionProps = {
  phaseId: number
}

const CopyPhaseAction = ({ phaseId }: TCopyPhaseActionProps) => {
  const dispatch = useAppDispatch()

  const copyPhaseHandler = () => {
    // openFixedLoadingHandler(true)
    // phaseService
    //    .copyPhase(phaseId)
    //    .then((res) => {
    //       dispatch(copyPhase(res))
    //    })
    //    .catch((error) => {
    //       toast.error(axiosErrorHandler.handleHttpError(error).message)
    //    })
    //    .finally(() => {
    //       openFixedLoadingHandler(false)
    //    })
  }

  return (
    <li
      onClick={copyPhaseHandler}
      className="cursor-pointer hover:bg-hover-silver-bgcl py-[6px] px-3 text-regular-text-cl text-sm font-medium"
    >
      Copy phase
    </li>
  )
}

type TMovePhaseProps = {
  phaseData: TPhaseData
  onMoveSucceeds: () => void
}

const MovePhase = ({ phaseData, onMoveSucceeds }: TMovePhaseProps) => {
  const phases = useAppSelector(({ project }) => project.phases!)
  const projectId = useAppSelector(({ project }) => project.project!.id)
  const [open, setOpen] = useState<boolean>(false)
  const [toPosition, setToPosition] = useState<number>(phaseData.position)
  const [loading, setLoading] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const phasesCount = phases.length
  const { position: currentPosition, id: phaseId } = phaseData

  const movePhaseHandler = () => {
    // setLoading(true)
    // phaseService
    //    .movePhase(projectId, phaseId, toPosition)
    //    .then(() => {
    //       onMoveSucceeds()
    //       toast.success("Move phase successfully!")
    //       dispatch(movePhase({ phaseId, toPosition }))
    //    })
    //    .catch((error) => {
    //       toast.error(axiosErrorHandler.handleHttpError(error).message)
    //    })
    //    .finally(() => {
    //       setLoading(false)
    //    })
  }

  const onChangePositionToMove = (e: SelectChangeEvent<unknown>) => {
    setToPosition(parseInt(e.target.value as string))
  }

  return (
    <>
      <li
        onClick={() => setOpen(true)}
        className="cursor-pointer hover:bg-hover-silver-bgcl py-[6px] px-3 text-regular-text-cl text-sm font-medium"
      >
        Move phase
      </li>

      <StyledDialog
        TransitionComponent={Fade}
        open={open}
        onClose={() => setOpen(false)}
        scroll="body"
        maxWidth="sm"
        fullWidth
        aria-hidden="true"
      >
        <DialogContent>
          <div className="flex flex-col rounded-xl min-h-[300px] text-regular-text-cl">
            <header className="relative py-1 w-full">
              <h3 className="w-full text-center text-sm font-bold">Move phase</h3>
              <button
                onClick={() => setOpen(false)}
                className="flex absolute right-0 top-0 p-1 rounded-md hover:bg-modal-btn-hover-bgcl"
              >
                <CloseIcon className="text-regular-text-cl" fontSize="small" />
              </button>
            </header>
            <hr className="mt-2" />
            <div className="mt-3">
              <div className="flex items-center gap-x-3 mb-1">
                <SubtitlesIcon />
                <h3 className="font-bold">Title</h3>
              </div>
              <div className="text-base py-2 px-3 rounded bg-modal-btn-bgcl">{phaseData.title}</div>
            </div>
            <div className="mt-5">
              <div className="flex items-center gap-x-3 mb-1">
                <OpenWithIcon />
                <h3 className="mb-0.5 font-semibold">Move phase to position</h3>
              </div>
              <FormControl fullWidth>
                <StyledSelect
                  size="small"
                  value={toPosition}
                  onChange={onChangePositionToMove}
                  MenuProps={{
                    PopoverClasses: {
                      paper: "!bg-modal-popover-bgcl w-[112px] border border-regular-border-cl",
                    },
                  }}
                >
                  {phasesCount > 0 &&
                    phases.map(({ id, position }) => (
                      <StyledMenuItem key={id} value={position}>
                        <span>{`${position + 1}${currentPosition === position ? " (current)" : ""}`}</span>
                      </StyledMenuItem>
                    ))}
                </StyledSelect>
              </FormControl>
              <button
                onClick={movePhaseHandler}
                type="submit"
                className="rounded py-1 text-black font-bold mt-2 px-4 bg-confirm-btn-bgcl hover:bg-confirm-btn-hover-bgcl"
              >
                {loading ? (
                  <div className="flex h-[24px]">
                    <LogoLoading size="small" color="black" className="m-auto" />
                  </div>
                ) : (
                  <span>Move</span>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </StyledDialog>
    </>
  )
}

type TPhaseActions = "copy-phase" | "move-phase" | "about-phase"

type TPhaseActionsProps = {
  phaseData: TPhaseData
}

export const PhaseMenu = ({ phaseData }: TPhaseActionsProps) => {
  const { id } = phaseData
  const [anchorEle, setAnchorEle] = useState<HTMLButtonElement>()

  const hanleActions = (type: TPhaseActions) => {
    switch (type) {
      case "copy-phase":
        break
      case "move-phase":
        break
      case "about-phase":
        eventEmitter.emit(EInternalEvents.OPEN_ADD_PHASE_DESCRIPTION, true, phaseData)
        break
    }
    setAnchorEle(undefined)
  }

  const handleOpen = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      setAnchorEle(e.currentTarget)
    } else {
      setAnchorEle(undefined)
    }
  }

  return (
    <>
      <Tooltip title="List actions" arrow>
        <button className="p-1 h-fit rounded-sm hover:bg-[#282F27]" onClick={handleOpen}>
          <MoreHorizIcon fontSize="small" />
        </button>
      </Tooltip>

      <StyledPopover
        anchorEl={anchorEle}
        open={!!anchorEle}
        onClose={() => handleOpen()}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <div className="bg-transparent min-w-52 py-1 pb-3 border border-solid border-regular-border-cl rounded-lg">
          <header className="flex py-1 px-2 items-center">
            <h3 className="grow text-regular-text-cl font-semibold text-sm text-center">
              Phase actions
            </h3>
            <button
              onClick={() => handleOpen()}
              className="flex h-8 w-8 hover:bg-hover-silver-bgcl rounded"
            >
              <CloseIcon fontSize="small" className="text-regular-text-cl m-auto" />
            </button>
          </header>
          <ul className="mt-2">
            <DeletePhaseAction phaseId={id} />
            {/* <CopyPhaseAction phaseId={id} />
            <MovePhase phaseData={phaseData} onMoveSucceeds={() => handleOpen()} />
            <li
              onClick={() => hanleActions("about-phase")}
              className="cursor-pointer hover:bg-hover-silver-bgcl py-[6px] px-3 text-regular-text-cl text-sm font-medium"
            >
              About phase
            </li> */}
          </ul>
        </div>
      </StyledPopover>
    </>
  )
}

const StyledPopover = styled(Popover)({
  "& .MuiPaper-root": {
    borderRadius: 8,
    backgroundColor: "var(--ht-modal-popover-bgcl)",
    height: "fit-content",
    "& .MuiList-root": {
      backgroundColor: "var(--ht-modal-popover-bgcl)",
      borderRadius: 8,
    },
  },
})

const StyledDialog = styled(Dialog)({
  "& .MuiPaper-root": {
    borderRadius: 9,
    backgroundColor: "var(--ht-modal-board-bgcl)",
    "& .MuiDialogContent-root": {
      backgroundColor: "var(--ht-modal-board-bgcl)",
      padding: 15,
    },
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
