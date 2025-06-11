import dayjs from "dayjs"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import { updateProject } from "../../../redux/project/project-slice"
import { useCallback, useEffect, useState } from "react"
import { Dayjs } from "dayjs"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useDebounce } from "../../../hooks/debounce"
import { TTaskDatesBoardData } from "../../../utils/types"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../../utils/axios-error-handler"
import { LogoLoading } from "../../../components/Loadings"
import validator from "validator"
import { EInternalEvents, eventEmitter } from "../../../utils/events"
import CloseIcon from "@mui/icons-material/Close"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { Popover, styled, TextField } from "@mui/material"
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar"
import { TimeField } from "@mui/x-date-pickers/TimeField"
import { DateField } from "@mui/x-date-pickers/DateField"
import type { TProjectData } from "../../../services/types"
import { projectService } from "../../../services/project-service"

type TIsSaving = "none" | "due-date" | "seconds"

type TProjectDatesProps = {
  projectData: TProjectData
}

const DatesBoard = ({ projectData }: TProjectDatesProps) => {
  const [boardData, setBoardData] = useState<TTaskDatesBoardData>()
  const [newDueDate, setNewDueDate] = useState<Dayjs | null>(null)
  const dateAdapter = new AdapterDayjs()
  const dispatch = useAppDispatch()
  const debounce = useDebounce()
  const [isSaving, setIsSaving] = useState<TIsSaving>("none")
  const [seconds, setSeconds] = useState<string>("Unset")

  const anchorEle = boardData?.anchorEle || null

  const handleChangeSeconds = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "") {
      setSeconds("")
    } else if (validator.isNumeric(value)) {
      setSeconds(value.replace(/^0+/, ""))
    }
  }

  const catchEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveSeconds()
    }
  }

  const handleFocusSecondsInput = () => {
    if (seconds === "Unset") {
      setSeconds("0")
    }
  }

  const handleBlurSecondsInput = () => {
    if (seconds === "" || seconds === "0") {
      setSeconds("Unset")
    }
  }

  const saveSeconds = () => {
    if (seconds === "Unset" || !projectData) {
      return
    }
    setIsSaving("seconds")
    const isoString = dayjs().add(parseInt(seconds), "seconds").toISOString()
    console.log('>>> iso string:', isoString)
    projectService
      .updateProject(projectData.id, { endDate: isoString })
      .then(() => {
        dispatch(updateProject({ endDate: isoString }))
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
      .finally(() => {
        setIsSaving("none")
      })
  }

  const handleTypeDate = useCallback(
    debounce((date: Dayjs | null) => {
      setNewDueDate(date)
    }, 300),
    [],
  )

  const saveDates = () => {
    if (newDueDate && projectData) {
      const isoString = newDueDate.toISOString()
      setIsSaving("due-date")
      projectService
        .updateProject(projectData.id, { endDate: isoString })
        .then(() => {
          dispatch(updateProject({ endDate: isoString }))
        })
        .catch((error) => {
          toast.error(axiosErrorHandler.handleHttpError(error).message)
        })
        .finally(() => {
          setIsSaving("none")
        })
    }
  }

  useEffect(() => {
    if (projectData) {
      const projectEndDate = projectData.endDate
      setNewDueDate(projectEndDate ? dayjs(projectEndDate) : null)
    }
  }, [projectData])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.OPEN_TASK_DATES_BOARD, (boardData) => {
      setBoardData(boardData)
    })
    return () => {
      eventEmitter.off(EInternalEvents.OPEN_TASK_DATES_BOARD)
    }
  }, [])

  const handleCloseBoard = () => {
    setBoardData((pre) => (pre ? { ...pre, anchorEle: null } : undefined))
  }

  return (
    <>
      <StyledPopover
        open={!!anchorEle}
        anchorEl={anchorEle}
        onClose={handleCloseBoard}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        id="CODEVCN-task-dates-board"
      >
        <div className="bg-modal-popover-bgcl rounded-md pt-3 text-regular-text-cl w-[300px]">
          <header className="relative w-full py-1 px-3">
            <h3 className="w-full text-center text-sm font-bold">Dates</h3>
            <button
              onClick={handleCloseBoard}
              className="flex absolute right-3 top-0 p-1 rounded-md hover:bg-modal-btn-hover-bgcl"
            >
              <CloseIcon className="text-regular-text-cl" fontSize="small" />
            </button>
          </header>
          <div className="max-h-[435px] px-3 overflow-y-auto mt-2 css-styled-vt-scrollbar">
            <div className="w-full">
              <StyledDateCalendar
                value={newDueDate}
                showDaysOutsideCurrentMonth
                onChange={handleTypeDate}
                dayOfWeekFormatter={(date) => dateAdapter.format(date, "weekdayShort")}
                referenceDate={dayjs()}
                yearsOrder="desc"
                minDate={dayjs()}
              />
            </div>
            <div className="w-full mt-3">
              <h3 className="text-sm font-bold">End Date & End Time</h3>
              <div className="flex pt-2 gap-x-2">
                <StyledDueDate
                  label="End Date"
                  value={newDueDate}
                  onChange={handleTypeDate}
                  format="DD/MM/YYYY"
                  minDate={dayjs()}
                />
                <StyledTimeDate
                  label="End Time"
                  value={newDueDate}
                  onChange={handleTypeDate}
                  format="HH:mm:ss"
                  minTime={dayjs()}
                />
              </div>
            </div>
            <div className="pb-4 mt-3">
              <button
                onClick={saveDates}
                className="w-full rounded bg-confirm-btn-bgcl p-1 hover:bg-confirm-btn-hover-bgcl text-black text-sm font-semibold"
                disabled={isSaving === "due-date"}
              >
                {isSaving === "due-date" ? (
                  <div className="flex h-5 w-full">
                    <LogoLoading className="m-auto" color="black" size="small" />
                  </div>
                ) : (
                  "Save"
                )}
              </button>
            </div>
            <div className="py-3 mb-2">
              <h3 className="text-sm font-bold">In Seconds</h3>
              <div className="gap-x-2 mt-2">
                <StyledTextField
                  value={seconds}
                  onChange={handleChangeSeconds}
                  fullWidth
                  label="In Seconds"
                  variant="outlined"
                  onFocus={handleFocusSecondsInput}
                  onBlur={handleBlurSecondsInput}
                  onKeyUp={catchEnterKey}
                />
              </div>
              <div className="mt-3">
                <button
                  onClick={saveSeconds}
                  className="w-full rounded bg-confirm-btn-bgcl p-1 hover:bg-confirm-btn-hover-bgcl text-black text-sm font-semibold"
                  disabled={isSaving === "seconds"}
                >
                  {isSaving === "seconds" ? (
                    <div className="flex h-5 w-full">
                      <LogoLoading className="m-auto" color="black" size="small" />
                    </div>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </StyledPopover>
    </>
  )
}

export const ProjectDates = () => {
  const projectData = useAppSelector(({ project }) => project.project!)
  const { endDate } = projectData

  const openDueDatesBoard = (e: React.MouseEvent<HTMLButtonElement>) => {
    eventEmitter.emit(EInternalEvents.OPEN_TASK_DATES_BOARD, {
      anchorEle: e.currentTarget,
    })
  }

  return (
    <div className="flex flex-col text-regular-text-cl">
      <h3 className="text-sm font-bold mb-1 pl-1">Project End Date</h3>
      <button
        onClick={openDueDatesBoard}
        className="flex items-center justify-between grow gap-x-2 bg-modal-btn-bgcl hover:bg-modal-btn-hover-bgcl rounded py-1 px-2"
      >
        {endDate ? (
          <span className="text-sm">{dayjs(endDate).format("LLL")}</span>
        ) : (
          <span className="text-sm">Unset</span>
        )}
        <KeyboardArrowDownIcon fontSize="small" className="text-regular-text-cl" />
      </button>
      <DatesBoard projectData={projectData} />
    </div>
  )
}

const StyledPopover = styled(Popover)({
  "& .MuiPaper-root": {
    borderRadius: 6,
    backgroundColor: "var(--ht-modal-popover-bgcl)",
    border: "1px var(--ht-regular-border-cl) solid",
  },
})

const StyledDateCalendar = styled(DateCalendar)({
  "&.MuiDateCalendar-root": {
    width: "100%",
    height: 278,
    "& .MuiButtonBase-root": {
      "& svg": {
        fill: "var(--ht-regular-text-cl)",
      },
    },
    "& .MuiPickersCalendarHeader-root": {
      marginTop: 3,
    },
    "& .MuiDayCalendar-root": {
      "& .MuiDayCalendar-header": {
        "& .MuiDayCalendar-weekDayLabel": {
          color: "var(--ht-regular-text-cl)",
          fontWeight: "bold",
        },
      },
      "& .MuiDayCalendar-slideTransition": {
        minHeight: 190,
        scrollbarWidth: "thin",
        scrollbarColor: "var(--ht-scrollbar-thumb-bgcl) var(--ht-scrollbar-track-bgcl)",
        "& .MuiDayCalendar-monthContainer": {
          "& .MuiPickersDay-root": {
            color: "#B6C2CF",
            height: 34,
            width: 34,
            "&.MuiPickersDay-dayOutsideMonth": {
              color: "#7c8998",
            },
            "&:hover": {
              backgroundColor: "var(--ht-modal-btn-hover-bgcl)",
            },
            "&:focus": {
              backgroundColor: "#1976d261",
            },
            "&.Mui-selected": {
              backgroundColor: "var(--ht-confirm-btn-bgcl)",
              color: "black",
            },
            "&:not(.Mui-selected)": {
              borderColor: "var(--ht-outline-cl)",
            },
            "&.Mui-disabled": {
              opacity: 0.5,
            },
          },
        },
      },
    },
    "& .MuiYearCalendar-root": {
      width: "100%",
      height: 230,
      scrollbarWidth: "thin",
      scrollbarColor: "var(--ht-scrollbar-thumb-bgcl) var(--ht-scrollbar-track-bgcl)",
      "& .MuiPickersYear-root": {
        "& .MuiPickersYear-yearButton": {
          "&:hover": {
            backgroundColor: "var(--ht-modal-btn-hover-bgcl)",
          },
        },
      },
    },
  },
})

const DueDateTimeStyling = {
  "&.MuiFormControl-root": {
    "& .MuiFormLabel-root": {
      color: "var(--ht-regular-text-cl)",
    },
    "& .MuiInputBase-root": {
      "& .MuiInputBase-input": {
        color: "var(--ht-regular-text-cl)",
        padding: 10,
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: 2,
        borderColor: "var(--ht-regular-border-cl)",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "var(--ht-outline-cl)",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "var(--ht-outline-cl)",
      },
    },
  },
}

const StyledDueDate = styled(DateField)(DueDateTimeStyling)

const StyledTimeDate = styled(TimeField)(DueDateTimeStyling)

const StyledTextField = styled(TextField)(DueDateTimeStyling)
