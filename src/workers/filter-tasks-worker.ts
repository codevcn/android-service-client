import type { TTaskData } from "../services/types"
import { EPickDateValues } from "../utils/enums"
import type { TFilterTasksWorkerMsg, TTaskStatus } from "../utils/types"
import dayjs from "dayjs"
import isoWeek from "dayjs/plugin/isoWeek"

dayjs.extend(isoWeek)
dayjs().isoWeek()
dayjs().isoWeekday()
dayjs().isoWeekYear()

type TFilterByTaskTitleTask = {
   title: TTaskData["title"]
}

const filterByTaskTitle = (
   task: TFilterByTaskTitleTask,
   filterData: TFilterTasksWorkerMsg["filterData"]["taskTitle"],
): boolean => {
   if (filterData) {
      return task.title.toLowerCase().includes(filterData.toLowerCase())
   }
   return true
}

type TFilterByMemberIdsTask = {
   taskMembers: TTaskData["members"]
}

const filterByMemberIds = (
   task: TFilterByMemberIdsTask,
   filterData: TFilterTasksWorkerMsg["filterData"]["memberIds"],
): boolean => {
   if (filterData) {
      const taskMembers = task.taskMembers || []
      const taskMembersCount = taskMembers.length
      const filterDataCount = filterData.length
      if (taskMembersCount < filterDataCount) return false
      if (filterDataCount === 0) {
         if (taskMembersCount === 0) return true
         return false
      }
      let matchCount: number = 0
      for (const { id } of taskMembers) {
         if (filterData.includes(id)) {
            matchCount++
         }
      }
      return matchCount === filterDataCount
   }
   return true
}

type TFilterByDueDateTask = {
   dueDate: TTaskData["dueDate"]
}

const filterByDueDate = (
   task: TFilterByDueDateTask,
   filterData: TFilterTasksWorkerMsg["filterData"]["dueDate"],
): boolean => {
   if (filterData) {
      const taskDueDate = task.dueDate
      if (taskDueDate) {
         const now = dayjs()
         const targetDate = dayjs(taskDueDate)
         switch (filterData) {
            case EPickDateValues.NO_DUE_DATES:
               return false
            case EPickDateValues.OVERDUE:
               return targetDate.isBefore(now)
            case EPickDateValues.DUE_IN_NEXT_DAY:
               return targetDate.isSame(now.add(1, "day"), "day")
            case EPickDateValues.DUE_IN_NEXT_WEEK:
               return targetDate.isSame(now.add(1, "week"), "isoWeek")
            case EPickDateValues.DUE_IN_NEXT_MONTH:
               return targetDate.isSame(now.add(1, "month"), "month")
         }
      } else if (filterData === EPickDateValues.NO_DUE_DATES) {
         return true
      }
      return false
   }
   return true
}

type TFilterByTaskStatusTask = {
   status: TTaskStatus
}

const filterByTaskStatus = (
   task: TFilterByTaskStatusTask,
   filterData: TFilterTasksWorkerMsg["filterData"]["taskStatus"],
): boolean => {
   if (filterData) {
      return task.status === filterData
   }
   return true
}

type TTaskIds = TTaskData["id"][]

const mainFilter = (
   phases: TFilterTasksWorkerMsg["phases"],
   filterData: TFilterTasksWorkerMsg["filterData"],
): TTaskIds => {
   const filteredTaskIds: TTaskIds = []
   for (const { taskPreviews } of phases) {
      if (taskPreviews && taskPreviews.length > 0) {
         for (const task of taskPreviews) {
            if (
               filterByTaskTitle(task, filterData.taskTitle) &&
               filterByMemberIds(task, filterData.memberIds) &&
               filterByDueDate(task, filterData.dueDate) &&
               filterByTaskStatus(task, filterData.taskStatus)
            ) {
               filteredTaskIds.push(task.id)
            }
         }
      }
   }
   return filteredTaskIds
}

onmessage = (e: MessageEvent<TFilterTasksWorkerMsg>) => {
   const { filterData, phases } = e.data
   postMessage(mainFilter(phases, filterData))
}
