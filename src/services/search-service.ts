// đã sửa xong file này

import { projectBackgrounds } from "../lib/project-static-data"
import { apiGeneralSearch } from "./apis/search-apis"
import type { TGeneralSearchData } from "./types"

class SearchService {
  async generalSearch(keyword: string): Promise<TGeneralSearchData> {
    const { data } = await apiGeneralSearch(keyword)
    if (!data)
      return {
        projects: [],
        phases: [],
        tasks: [],
      }
    const searchData = data.data
    return {
      projects: searchData.projects.map((project) => {
        return {
          id: project.id,
          title: project.title,
          background: projectBackgrounds[0],
        }
      }),
      phases: searchData.phases.map((phase) => {
        return {
          id: phase.id,
          title: phase.title,
          project: {
            id: phase.project.id,
            title: phase.project.title,
          },
        }
      }),
      tasks: searchData.tasks.map((task) => {
        return {
          id: task.id,
          title: task.title,
          project: {
            id: task.project.id,
            title: task.project.title,
          },
          phase: {
            id: task.phase.id,
            title: task.phase.title,
          },
        }
      }),
    }
  }
}

export const searchService = new SearchService()
