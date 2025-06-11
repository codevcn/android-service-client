// đã sửa xong file này

import type { TSuccess } from "../utils/types"
import {
  apiCreatePhase,
  apiDeletePhase,
  apiGetPhasesByProject,
  apiMovePhase,
  apiUpdatePhase,
} from "./apis/phase-apis"
import type { TPhaseData } from "./types"
import type { TPhaseInput } from "./apis/types/input-types"
import { convertISOStringToLocalTime } from "../utils/helpers"
import dayjs from "dayjs"
import { ELocalTimeFormat } from "../utils/enums"
import { taskService } from "./task-service"

class PhaseService {
  async getPhases(projectId: number): Promise<TPhaseData[]> {
    const { data } = await apiGetPhasesByProject({ projectId })
    if (!data) throw new Error("No phases found")
    const phasesData: TPhaseData[] = []
    const phases = data.data
    for (const phase of phases) {
      const tasks = await taskService.getTasksByPhase(phase.id)
      phasesData.push({
        id: phase.id,
        title: phase.phaseName,
        position: phase.orderIndex,
        description: phase.description,
        taskPreviews: tasks,
      })
    }
    return phasesData
  }

  async createPhase(projectId: number, phase: TPhaseInput): Promise<TPhaseData> {
    const { phaseName, description, orderIndex, status, startDate } = phase
    const { data } = await apiCreatePhase({
      project: { id: projectId },
      phaseName,
      description: description || "",
      orderIndex,
      status,
      startDate: startDate
        ? convertISOStringToLocalTime(startDate)
        : dayjs().format(ELocalTimeFormat.DATE_TIME_WITH_MS),
    })
    if (!data) throw new Error("No phase created")
    const phaseData = data.data
    return {
      id: phaseData.id,
      title: phaseData.phaseName,
      position: phaseData.orderIndex,
      description: phaseData.description,
      taskPreviews: [],
    }
  }

  async updatePhase(
    phaseId: number,
    updateData: Partial<TPhaseData>,
    projectId: number,
  ): Promise<TPhaseData> {
    const { data } = await apiUpdatePhase(
      phaseId,
      {
        phaseName: updateData.title,
        description: updateData.description || "",
        orderIndex: updateData.position,
      },
      projectId,
    )
    if (!data) throw new Error("No phase updated")
    const phaseData = data.data
    return {
      id: phaseData.id,
      title: phaseData.phaseName,
      position: phaseData.orderIndex,
      description: phaseData.description,
      taskPreviews: [],
    }
  }

  async copyPhase(projectId: number, phase: TPhaseInput): Promise<TPhaseData> {
    return await this.createPhase(projectId, phase)
  }

  async deletePhase(phaseId: number): Promise<TSuccess> {
    await apiDeletePhase(phaseId)
    return { success: true }
  }

  async movePhase(phaseId: number, newPosition: number): Promise<TSuccess> {
    await apiMovePhase(phaseId, { newPosition })
    return { success: true }
  }
}

export const phaseService = new PhaseService()
