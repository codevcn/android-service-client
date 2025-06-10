import { createContext, useContext } from "react"
import type { TPhaseData } from "../../../services/types"

export const PhaseDataContext = createContext<TPhaseData | undefined>(undefined)

export const usePhaseDataContext = () => useContext(PhaseDataContext)
