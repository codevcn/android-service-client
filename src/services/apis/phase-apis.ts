import { clientAxios } from "../../configs/api-configs"
import type { TPhaseInput, TPhaseIdParam, TProjectIdParam } from "./types/input-types"
import type { TPhaseResponse, TPhasesResponse, TMessageResponse } from "./types/output-types"

export const apiGetPhasesByProject = async ({
  projectId,
}: TProjectIdParam): Promise<TPhasesResponse> => clientAxios.get(`/phases/project/${projectId}`)

export const apiGetPhase = async (phaseId: TPhaseIdParam): Promise<TPhaseResponse> =>
  clientAxios.get(`/phases/${phaseId}`)

export const apiCreatePhase = async (payload: TPhaseInput): Promise<TPhaseResponse> =>
  clientAxios.post("/phases", payload)

export const apiUpdatePhase = async (
  phaseId: TPhaseIdParam,
  payload: Partial<TPhaseInput>,
  projectId: number,
): Promise<TPhaseResponse> =>
  clientAxios.put(`/phases/${phaseId}`, payload, { params: { projectId } })

export const apiDeletePhase = async (phaseId: TPhaseIdParam): Promise<TMessageResponse> =>
  clientAxios.delete(`/phases/${phaseId}`)

export const apiMovePhase = async (
  phaseId: TPhaseIdParam,
  payload: { newPosition: number },
): Promise<TMessageResponse> =>
  clientAxios.put(`/phases/${phaseId}/move`, {}, { params: { position: payload.newPosition } })
