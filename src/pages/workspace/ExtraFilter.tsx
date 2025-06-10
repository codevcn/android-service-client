import { useCallback, useEffect, useState } from "react"
import { EInternalEvents, eventEmitter } from "../../utils/events"
import { styled } from "@mui/material"
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField"
import dayjs, { Dayjs } from "dayjs"
import { useDebounce } from "../../hooks/debounce"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import customParseFormat from "dayjs/plugin/customParseFormat"
import type { TFilterProjectsData } from "../../utils/types"
import type { TProjectPreviewData } from "../../services/types"

dayjs.extend(customParseFormat)

type TFilterProps = {
   onFilter: (partialData: TFilterProjectsData) => void
   projects: TProjectPreviewData[] | null
}

export const ExtraFilter = ({ onFilter, projects }: TFilterProps) => {
   const [open, setOpen] = useState<boolean>(false)
   const [filterState, setFilterState] = useState<Omit<TFilterProjectsData, "title">>({})
   const debounce = useDebounce()
   const dateFormat: string = "DD/MM/YYYY HH:mm"
   const { toDate, fromDate } = filterState

   const handleTypeDate = useCallback(
      debounce((date: Dayjs | null, type: "from-date" | "to-date") => {
         if (date && dayjs(date, dateFormat, true).isValid()) {
            const finalDateValue = date.toISOString()
            const isFromDataType = type === "from-date"
            setFilterState((pre) => ({
               ...pre,
               ...(isFromDataType ? { fromDate: finalDateValue } : { toDate: finalDateValue }),
            }))
            onFilter(isFromDataType ? { fromDate: finalDateValue } : { toDate: finalDateValue })
         }
      }, 300),
      [projects],
   )

   const listenOpenProjectsFilter = () => {
      eventEmitter.on(EInternalEvents.OPEN_PROJECTS_FILTER, () => {
         setOpen((pre) => !pre)
      })
   }

   useEffect(() => {
      listenOpenProjectsFilter()
      return () => {
         eventEmitter.off(EInternalEvents.OPEN_PROJECTS_FILTER)
      }
   }, [])

   return (
      <div className={`${open ? "h-auto" : "h-0"} overflow-hidden`}>
         <hr />
         <h1 className="flex items-center gap-2 px-4 pb-0 pt-3">
            <FilterAltIcon />
            <span className="text-lg font-bold">Filter Projects</span>
         </h1>
         <div className="p-4 text-regular-text-cl text-sm">
            <div>
               <h2 className="mb-3">Created date</h2>
               <div className="flex items-center gap-2">
                  <DatesField
                     label="From date"
                     value={fromDate ? dayjs(fromDate) : undefined}
                     onChange={(e) => handleTypeDate(e, "from-date")}
                     format={dateFormat}
                  />
                  <DatesField
                     label="To date"
                     value={toDate ? dayjs(toDate) : undefined}
                     onChange={(e) => handleTypeDate(e, "to-date")}
                     format={dateFormat}
                  />
               </div>
            </div>
         </div>
         <hr className="mb-5" />
      </div>
   )
}

const DateTimeStyling = {
   "&.MuiFormControl-root": {
      fontSize: "0.85rem",
      "& .MuiFormLabel-root": {
         color: "var(--ht-regular-text-cl)",
         transform: "translate(14px, 8px) scale(1)",
         "&.Mui-focused,&.MuiFormLabel-filled": {
            transform: "translate(14px, -9px) scale(0.75)",
         },
      },
      "& .MuiInputBase-root": {
         "& .MuiInputBase-input": {
            fontSize: "0.9rem",
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

const DatesField = styled(DateTimeField)(DateTimeStyling)
