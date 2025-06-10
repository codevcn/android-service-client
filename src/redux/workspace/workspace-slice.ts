import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { TProjectPreviewData } from "../../services/types"

type TInitialState = {
   projects: TProjectPreviewData[] | null
   filterResult: TProjectPreviewData[] | null
}

const initialState: TInitialState = {
   projects: null,
   filterResult: null,
}

export const workspaceSlice = createSlice({
   name: "workspace",
   initialState,
   reducers: {
      setProjects: (state, action: PayloadAction<TProjectPreviewData[] | null>) => {
         state.projects = action.payload
      },
      updateSingleProject: (state, action: PayloadAction<Partial<TProjectPreviewData>>) => {
         const updates = action.payload
         const updatesId = updates.id
         if (updatesId) {
            const project = state.projects?.find(({ id }) => updatesId === id)
            if (project) {
               Object.assign(project, updates)
            }
         }
      },
      setFilterResult: (state, action: PayloadAction<TProjectPreviewData[] | null>) => {
         state.filterResult = action.payload
      },
   },
})

export const { setProjects, updateSingleProject, setFilterResult } = workspaceSlice.actions
