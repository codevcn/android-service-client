import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type {
  TCommentData,
  TPhaseData,
  TProjectData,
  TProjectMemberData,
  TProjectRequestData,
  TTaskData,
} from "../../services/types"
import type {
  TAddNewTaskMemberAction,
  TDeleteTaskAction,
  TMovePhaseAction,
  TMoveTaskState,
  TPhaseTaskPreview,
  TProjectFetchedItem,
  TRemoveTaskMemberAction,
  TTaskDataState,
  TUpdateFetchedListAction,
} from "../../utils/types"

type TInitialState = {
  fetchedList: TProjectFetchedItem[]
  project: TProjectData | null
  phases: TPhaseData[] | null
  filterResult: TPhaseData[] | null
  taskData: TTaskDataState | null
  requests: TProjectRequestData[] | null
}

const initialState: TInitialState = {
  fetchedList: [],
  project: null,
  phases: null,
  taskData: null,
  filterResult: null,
  requests: null,
}

export const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    updateFetchedList: (state, action: PayloadAction<TUpdateFetchedListAction>) => {
      const updates = action.payload
      if (updates.type === "fetched") {
        state.fetchedList.push(...updates.fetchedItems)
      } else {
        state.fetchedList = state.fetchedList.filter((fetchedItem) =>
          updates.fetchedItems.includes(fetchedItem),
        )
      }
    },
    setProject: (state, action: PayloadAction<TProjectData | null>) => {
      state.project = action.payload
    },
    updateProject: (state, action: PayloadAction<Partial<TProjectData>>) => {
      const currentProject = state.project
      if (currentProject) {
        Object.assign(currentProject, action.payload)
      }
    },
    setPhases: (state, action: PayloadAction<TPhaseData[] | null>) => {
      state.phases = action.payload
    },
    deletePhase: (state, action: PayloadAction<TPhaseData["id"]>) => {
      const phaseIdToDelete = action.payload
      state.phases = state.phases?.filter((phase) => phase.id !== phaseIdToDelete) || null
    },
    updateSinglePhase: (state, action: PayloadAction<Partial<TPhaseData>>) => {
      const updates = action.payload
      const updatesId = updates.id
      if (updatesId) {
        const phase = state.phases?.find(({ id }) => id === updatesId)
        if (phase) {
          Object.assign(phase, updates)
        }
      }
    },
    updateTaskPreview: (state, action: PayloadAction<Partial<TPhaseTaskPreview>>) => {
      const updates = action.payload
      const { phaseId, id: taskId } = updates
      if (phaseId && taskId) {
        const currentTaskPreviews = state.phases?.find(
          (phase) => phase.id === phaseId,
        )?.taskPreviews
        const taskPreview = currentTaskPreviews?.find((task) => task.id === taskId)
        if (taskPreview) {
          Object.assign(taskPreview, updates)
        }
      }
    },
    addNewTaskPreview: (state, action: PayloadAction<TPhaseTaskPreview>) => {
      const newTaskPreview = action.payload
      const taskPhase = state.phases?.find((phase) => phase.id === newTaskPreview.phaseId)
      if (taskPhase) {
        const currentTaskPreviews = taskPhase.taskPreviews
        if (currentTaskPreviews && currentTaskPreviews.length > 0) {
          currentTaskPreviews.push(newTaskPreview)
        } else {
          taskPhase.taskPreviews = [newTaskPreview]
        }
      }
    },
    addNewPhase: (state, action: PayloadAction<TPhaseData>) => {
      state.phases?.push(action.payload)
    },
    setTaskData: (state, action: PayloadAction<TTaskDataState | null>) => {
      state.taskData = action.payload
    },
    updateTaskData: (state, action: PayloadAction<Partial<TTaskData>>) => {
      const currentTaskData = state.taskData
      const updates = action.payload
      if (currentTaskData) {
        Object.assign(currentTaskData, updates)
      }
    },
    addNewComment: (state, action: PayloadAction<TCommentData>) => {
      const newComment = action.payload
      const currentComments = state.taskData?.comments
      if (currentComments && currentComments.length > 0) {
        currentComments.unshift(newComment)
      } else {
        if (state.taskData) {
          state.taskData.comments = [newComment]
        }
      }
    },
    updateComment: (state, action: PayloadAction<Partial<Omit<TCommentData, "user">>>) => {
      const updates = action.payload
      const currentComments = state.taskData?.comments
      if (currentComments) {
        for (const comment of currentComments) {
          if (comment.id === updates.id) {
            Object.assign(comment, updates)
            break
          }
        }
      }
    },
    deleteComment: (state, action: PayloadAction<TCommentData["id"]>) => {
      const commentId = action.payload
      const taskData = state.taskData
      if (taskData) {
        taskData.comments = taskData.comments!.filter((comment) => comment.id !== commentId)
      }
    },
    addNewTaskMember: (state, action: PayloadAction<TAddNewTaskMemberAction>) => {
      const { taskMemberData, phaseId, taskId } = action.payload
      const currentMembers = state.taskData?.members
      if (currentMembers && currentMembers.length > 0) {
        currentMembers.push(taskMemberData)
      } else {
        if (state.taskData) {
          state.taskData.members = [taskMemberData]
        }
      }
      const taskPreviews = state.phases?.find((phase) => phase.id === phaseId)?.taskPreviews
      if (taskPreviews) {
        for (const taskPreview of taskPreviews) {
          if (taskPreview.id === taskId) {
            if (taskPreview.taskMembers) {
              taskPreview.taskMembers.push(taskMemberData)
            } else {
              taskPreview.taskMembers = [taskMemberData]
            }
            break
          }
        }
      }
    },
    removeTaskMember: (state, action: PayloadAction<TRemoveTaskMemberAction>) => {
      const { memberId, phaseId, taskId } = action.payload
      const task = state.taskData
      if (task) {
        const currentMembers = task.members
        if (currentMembers && currentMembers.length > 0) {
          task.members = currentMembers.filter((member) => member.id !== memberId)
        }
      }
      const taskPreviews = state.phases?.find((phase) => phase.id === phaseId)?.taskPreviews
      if (taskPreviews) {
        for (const taskPreview of taskPreviews) {
          if (taskPreview.id === taskId) {
            taskPreview.taskMembers =
              taskPreview.taskMembers?.filter((member) => member.id !== memberId) || null
            break
          }
        }
      }
    },
    deleteTask: (state, action: PayloadAction<TDeleteTaskAction>) => {
      const phaseId = action.payload.phaseId
      const taskId = action.payload.taskId
      const phase = state.phases?.find((phase) => phase.id === phaseId)
      if (phase && phase.taskPreviews) {
        phase.taskPreviews = phase.taskPreviews.filter((taskPreview) => taskPreview.id !== taskId)
      }
      if (state.taskData?.id === taskId) {
        state.taskData = null
      }
    },
    updateMemberInProject: (state, action: PayloadAction<Partial<TProjectMemberData>>) => {
      const updates = action.payload
      const memberId = updates.id
      if (memberId) {
        const member = state.project?.members.find((mem) => mem.id === memberId)
        if (member) {
          Object.assign(member, updates)
        }
      }
    },
    removeMemberFromProject: (state, action: PayloadAction<TProjectMemberData["id"]>) => {
      const memberId = action.payload
      const project = state.project!
      project.members = project.members.filter((member) => member.id !== memberId)
    },
    moveTask: (state, action: PayloadAction<TMoveTaskState>) => {
      const { taskId, fromPhaseId, toPhaseId, toPosition } = action.payload
      const fromPhase = state.phases!.find(({ id }) => id === fromPhaseId)!
      const fromTaskPreviews = [...fromPhase.taskPreviews!]
      const fromIndex = fromTaskPreviews.findIndex(({ id }) => id === taskId)
      const [movedTask] = fromTaskPreviews.splice(fromIndex, 1)
      if (fromPhaseId === toPhaseId) {
        fromTaskPreviews.splice(toPosition, 0, movedTask)
      } else {
        const toPhase = state.phases!.find(({ id }) => id === toPhaseId)!
        const toTaskPreviews = [...toPhase.taskPreviews!]
        if (toTaskPreviews && toTaskPreviews.length > 0) {
          toTaskPreviews.splice(toPosition, 0, movedTask)
          toPhase.taskPreviews = toTaskPreviews.map((task, index) => ({
            ...task,
            position: index,
          }))
        } else {
          toPhase.taskPreviews = [movedTask]
        }
      }
      fromPhase.taskPreviews = fromTaskPreviews.map((task, index) => ({
        ...task,
        position: index,
      }))
      state.taskData!.phaseId = toPhaseId
    },
    setFilterResult: (state, action: PayloadAction<TPhaseData[] | null>) => {
      state.filterResult = action.payload
    },
    copyPhase: (state, action: PayloadAction<TPhaseData>) => {
      const phaseData = { ...action.payload }
      const phaseId = phaseData.id
      const phaseIndex = state.phases!.findIndex(({ id }) => phaseId === id)!
      state.phases!.splice(phaseIndex, 0, phaseData)
    },
    movePhase: (state, action: PayloadAction<TMovePhaseAction>) => {
      const { phaseId, toPosition } = action.payload
      const phases = [...state.phases!]
      const fromIndex = phases.findIndex(({ id }) => id === phaseId)
      const [movedPhase] = phases.splice(fromIndex, 1)
      phases.splice(toPosition, 0, movedPhase)
      state.phases = phases.map((task, index) => ({
        ...task,
        position: index,
      }))
    },
    setRequests: (state, action: PayloadAction<TProjectRequestData[]>) => {
      state.requests = action.payload
    },
    updateRequests: (state, action: PayloadAction<Partial<TProjectRequestData>[]>) => {
      const requests = state.requests
      const updates = action.payload
      if (requests && requests.length > 0) {
        for (const req of requests) {
          Object.assign(req, updates.find(({ id }) => req.id === id)!)
        }
      }
    },
    setProjectMembers: (state, action: PayloadAction<TProjectMemberData[]>) => {
      const project = state.project
      if (project) {
        project.members = action.payload
      }
    },
    resetState: () => initialState,
  },
})

export const {
  updateFetchedList,
  setProject,
  updateProject,
  setPhases,
  updateSinglePhase,
  updateTaskPreview,
  addNewTaskPreview,
  addNewPhase,
  setTaskData,
  updateTaskData,
  addNewComment,
  addNewTaskMember,
  removeTaskMember,
  updateComment,
  deleteComment,
  deleteTask,
  deletePhase,
  updateMemberInProject,
  removeMemberFromProject,
  moveTask,
  setFilterResult,
  copyPhase,
  movePhase,
  setRequests,
  updateRequests,
  setProjectMembers,
  resetState,
} = projectSlice.actions
