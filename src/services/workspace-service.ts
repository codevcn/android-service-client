import { projectService } from "./project-service"
import { TProjectPreviewData } from "./types"
import { apiGetStatistics } from "./apis/statistics-apis"
import type { TStatisticsData } from "./types"

class WorkspaceService {
  async getProjects(): Promise<TProjectPreviewData[]> {
    const projects = await projectService.getProjects()
    if (!projects) throw new Error("Projects not found")
    return projects
  }

  async getStatistics(): Promise<TStatisticsData> {
    const statistics = await apiGetStatistics()
    if (!statistics) throw new Error("Statistics not found")
    return statistics.data.data
  }
}

export const workspaceService = new WorkspaceService()
