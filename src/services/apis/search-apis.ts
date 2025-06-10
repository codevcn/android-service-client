import { clientAxios } from "../../configs/api-configs"
import type { TGeneralSearchResponse } from "./types/output-types"

export const apiGeneralSearch = async (keyword: string): Promise<TGeneralSearchResponse> =>
  clientAxios.get(`/search/general?keyword=${keyword}`)
