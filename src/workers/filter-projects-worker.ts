import type { TProjectPreviewData } from "../services/types"
import dayjs from "dayjs"
import isBetween from "dayjs/plugin/isBetween"
import type { TFilterProjectsWorkerMsg } from "../utils/types"

dayjs.extend(isBetween)

type TFilterByProjectTitleProject = {
   title: TProjectPreviewData["title"]
}

const filterByProjectTitle = (
   project: TFilterByProjectTitleProject,
   filterData: TFilterProjectsWorkerMsg["filterData"]["title"],
): boolean => {
   if (filterData) {
      return project.title.toLowerCase().includes(filterData.toLowerCase())
   }
   return true
}

type TFilterByCreatedTime = {
   createdAt: TProjectPreviewData["createdAt"]
}

const filterByCreatedDate = (
   project: TFilterByCreatedTime,
   fromDateData: TFilterProjectsWorkerMsg["filterData"]["fromDate"],
   toDateData: TFilterProjectsWorkerMsg["filterData"]["toDate"],
): boolean => {
   if (fromDateData && toDateData) {
      return dayjs(project.createdAt).isBetween(dayjs(fromDateData), dayjs(toDateData), null, "[]")
   } else if (fromDateData) {
      return dayjs(project.createdAt).isAfter(dayjs(fromDateData))
   } else if (toDateData) {
      return dayjs(project.createdAt).isBefore(dayjs(toDateData))
   }
   return true
}

type TProjectIds = TProjectPreviewData["id"][]

const mainFilter = (
   projects: TFilterProjectsWorkerMsg["projects"],
   filterData: TFilterProjectsWorkerMsg["filterData"],
): TProjectIds => {
   const filteredProjectIds: TProjectIds = []
   for (const project of projects) {
      if (
         filterByProjectTitle(project, filterData.title) &&
         filterByCreatedDate(project, filterData.fromDate, filterData.toDate)
      ) {
         filteredProjectIds.push(project.id)
      }
   }
   return filteredProjectIds
}

onmessage = (e: MessageEvent<TFilterProjectsWorkerMsg>) => {
   const { filterData, projects } = e.data
   postMessage(mainFilter(projects, filterData))
}
