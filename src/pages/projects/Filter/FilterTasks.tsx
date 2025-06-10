import FilterListIcon from "@mui/icons-material/FilterList"
import { Popover, Fade, styled, RadioGroup, FormControlLabel, Radio } from "@mui/material"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import { useDebounce } from "../../../hooks/debounce"
import { createWebWorker } from "../../../utils/helpers"
import { FilterByMembers } from "./FilterByMembers"
import { FilterByDueDate } from "./FilterByDates"
import type {
  TFilterTasksData,
  TFilterTasksWorkerMsg,
  TFilterTasksWorkerRes,
} from "../../../utils/types"
import { setFilterResult } from "../../../redux/project/project-slice"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import { TPhaseData } from "../../../services/types"

type TFilterByKeywordProps = {
  onFilter: (filterData: TFilterTasksData) => void
}

const FilterByTaskTitle = ({ onFilter }: TFilterByKeywordProps) => {
  const doFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.currentTarget.value
    if (keyword && keyword.length > 0) {
      onFilter({ taskTitle: keyword })
    } else {
      onFilter({ taskTitle: undefined })
    }
  }

  return (
    <div>
      <label className="block text-sm font-bold mb-1 w-fit" htmlFor="filter-keyword">
        Keyword
      </label>
      <input
        className="w-full px-2 py-1 inset-0 focus:border-outline-cl bg-focused-textfield-bgcl border-2 border-regular-border-cl rounded text-regular-text-cl placeholder-gray-500"
        id="filter-keyword"
        placeholder="Enter a keyword..."
        type="text"
        onChange={doFilter}
      />
      <p className="text-xs text-gray-400 mt-1">Search cards, members, labels, and more.</p>
    </div>
  )
}

enum EPickStatusValues {
  COMPLETE = "complete",
  UNCOMPLETE = "uncomplete",
}

type TFilterByStatusProps = {
  onFilter: (filterData: TFilterTasksData) => void
}

const FilterByStatus = ({ onFilter }: TFilterByStatusProps) => {
  const [clearFlag, setClearFlag] = useState<boolean>(false)

  const pickStatus = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilter({ taskStatus: e.currentTarget.value as EPickStatusValues })
  }

  const clear = () => {
    onFilter({ taskStatus: undefined })
    setClearFlag((pre) => !pre)
  }

  return (
    <div key={clearFlag ? 1 : 0} className="mt-6">
      <div className="flex justify-between items-center w-full">
        <h3 className="text-sm font-semibold mb-1">Task status</h3>
        <button
          onClick={clear}
          className="text-xs py-0.5 px-3 bg-modal-btn-bgcl hover:bg-modal-btn-hover-bgcl rounded"
        >
          Clear
        </button>
      </div>
      <RadioGroup onChange={pickStatus}>
        <FormControlLabel
          value={EPickStatusValues.COMPLETE}
          control={<StyledRadio size="small" />}
          label={<p className="text-sm">Marked as complete</p>}
        />
        <FormControlLabel
          value={EPickStatusValues.UNCOMPLETE}
          control={<StyledRadio size="small" />}
          label={<p className="text-sm">Not marked as complete</p>}
        />
      </RadioGroup>
    </div>
  )
}

type TOpenFilterBtnProps = {
  onClearAllFilter: () => void
  onOpenFilter: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const OpenFilterBtn = ({ onClearAllFilter, onOpenFilter }: TOpenFilterBtnProps) => {
  const { filterResult } = useAppSelector(({ project }) => project)
  const dispatch = useAppDispatch()

  const clearFilter = () => {
    dispatch(setFilterResult(null))
    onClearAllFilter()
  }

  const filteredTasksCount = useMemo<number>(() => {
    return filterResult?.reduce((acc, curr) => acc + (curr.taskPreviews?.length || 0), 0) || 0
  }, [filterResult])

  return (
    <div className="flex items-center text-sm rounded overflow-hidden">
      <button
        onClick={onOpenFilter}
        className={`${filteredTasksCount > 0 ? "bg-silver-white-bgcl hover:bg-white text-black" : ""} flex items-center py-1 px-2 gap-x-1 hover:bg-[#ffffff33]`}
      >
        <FilterListIcon sx={{ height: 20, width: 20 }} />
        <span>Filter tasks</span>
        {filteredTasksCount > 0 && (
          <span className="bg-[#0c66e4] px-1 rounded ml-1 text-white">{filteredTasksCount}</span>
        )}
      </button>
      {filteredTasksCount > 0 && (
        <button
          onClick={clearFilter}
          className="border-l border-solid border-l-gray-400 bg-silver-white-bgcl hover:bg-white text-black py-1 px-2 gap-x-1"
        >
          Clear all
        </button>
      )}
    </div>
  )
}

type TFilterTasksProps = {
  phases: TPhaseData[]
}

const Filter = ({ phases }: TFilterTasksProps) => {
  const [anchorEle, setAnchorEle] = useState<HTMLElement | null>(null)
  const filterTasksWorker = useRef<Worker>()
  const debounce = useDebounce()
  const filterDataRef = useRef<TFilterTasksData>({})
  const dispatch = useAppDispatch()
  const [clearAllFlag, setClearAllFlag] = useState<boolean>(false)

  const checkFilterDataIsEmpty = (filterData: TFilterTasksData): boolean => {
    if (Object.keys(filterData).length === 0) return true
    let count: number = 0
    for (const key in filterData) {
      if (filterData[key as keyof TFilterTasksData]) {
        count++
      }
    }
    return count === 0
  }

  const filterTasks = (partialData: TFilterTasksData): void => {
    const filterData = { ...filterDataRef.current, ...partialData }
    filterDataRef.current = filterData
    if (checkFilterDataIsEmpty(filterData)) {
      dispatch(setFilterResult(null))
    } else {
      const message: TFilterTasksWorkerMsg = {
        phases,
        filterData,
      }
      filterTasksWorker.current?.postMessage(message)
    }
  }

  const handleOpenFilterBoard = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      setAnchorEle(e.currentTarget)
    } else {
      setAnchorEle(null)
    }
  }

  const searchByTaskTitle = useCallback(debounce(filterTasks, 400), [phases])

  const doFilterWithResult = (taskIds: TFilterTasksWorkerRes) => {
    dispatch((dispatch, getState) => {
      const phases = getState().project.phases
      if (!phases || phases.length === 0) return
      const updatedPhases = phases.map((phase) => {
        const { taskPreviews } = phase
        if (taskPreviews && taskPreviews.length > 0) {
          const updatedTaskPreviews = taskPreviews.filter(({ id }) => taskIds.includes(id))
          return {
            ...phase,
            taskPreviews: updatedTaskPreviews.length > 0 ? updatedTaskPreviews : null,
          }
        }
        return phase
      })
      dispatch(setFilterResult(updatedPhases))
    })
  }

  const clearAllFilter = () => {
    filterDataRef.current = {}
    setClearAllFlag((pre) => !pre)
  }

  useEffect(() => {
    filterTasksWorker.current = createWebWorker("/src/workers/filter-tasks-worker.ts")
    filterTasksWorker.current.onmessage = (e: MessageEvent<TFilterTasksWorkerRes>) => {
      doFilterWithResult(e.data)
    }
    return () => {
      filterTasksWorker.current?.terminate()
    }
  }, [])

  useEffect(() => {
    filterTasks({})
  }, [phases])

  return (
    <>
      <OpenFilterBtn onClearAllFilter={clearAllFilter} onOpenFilter={handleOpenFilterBoard} />

      <FilterTasksBoard
        anchorEl={anchorEle}
        open={!!anchorEle}
        onClose={() => handleOpenFilterBoard()}
        TransitionComponent={Fade}
        keepMounted
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <div className="flex flex-col bg-modal-popover-bgcl text-modal-text-cl pt-3 rounded-lg w-full h-full">
          <header className="pt-1 pb-4 px-5 relative">
            <h3 className="text-regular-text-cl font-semibold text-base text-center">
              Filter tasks
            </h3>
            <button
              onClick={() => handleOpenFilterBoard()}
              className="flex h-8 w-8 hover:bg-hover-silver-bgcl rounded absolute top-0 right-2"
            >
              <CloseIcon fontSize="small" className="text-regular-text-cl m-auto" />
            </button>
          </header>
          <div
            key={clearAllFlag ? 1 : 0}
            className="css-styled-vt-scrollbar overflow-y-auto grow px-4 pb-3"
          >
            <FilterByTaskTitle onFilter={searchByTaskTitle} />
            <FilterByMembers onFilter={filterTasks} />
            <FilterByStatus onFilter={filterTasks} />
            {/* <FilterByDueDate onFilter={filterTasks} /> */}
          </div>
        </div>
      </FilterTasksBoard>
    </>
  )
}

export const FilterTasks = () => {
  const { phases } = useAppSelector(({ project }) => project)
  return phases && phases.length > 0 && <Filter phases={phases} />
}

const FilterTasksBoard = styled(Popover)({
  "& .MuiPaper-root": {
    borderRadius: 8,
    backgroundColor: "var(--ht-modal-popover-bgcl)",
    height: "calc(100vh - var(--ht-top-nav-height) - var(--ht-top-nav-height))",
    width: 380,
    "& .MuiList-root": {
      backgroundColor: "var(--ht-modal-popover-bgcl)",
      borderRadius: 8,
    },
  },
})

const StyledRadio = styled(Radio)({
  "& svg": {
    fill: "var(--ht-regular-text-cl)",
  },
  "& .MuiTouchRipple-child": {
    backgroundColor: "var(--ht-regular-text-cl)",
  },
})
