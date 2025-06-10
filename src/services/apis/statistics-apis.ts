import { clientAxios } from "../../configs/api-configs"
import { TStatisticsResponse } from "./types/output-types"

export const apiGetStatistics = async (): Promise<TStatisticsResponse> =>
  clientAxios.get("/statistics")
