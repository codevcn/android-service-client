import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { TNotificationData } from "../../services/types"
import type { TNotificationUnreadChangeAmount } from "../../utils/types"

type TInitialState = {
  notifications: TNotificationData[] | null
  filterResult: TNotificationData[] | null
  unreadCount: number
}

const initialState: TInitialState = {
  notifications: null,
  filterResult: null,
  unreadCount: 0,
}

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<TNotificationData[]>) => {
      state.notifications = action.payload
    },
    addNotifications: (state, action: PayloadAction<TNotificationData[]>) => {
      state.notifications?.unshift(...action.payload)
    },
    setFilterResult: (state, action: PayloadAction<TNotificationData[] | null>) => {
      state.filterResult = action.payload
    },
    updateSingleNotification: (state, action: PayloadAction<Partial<TNotificationData>>) => {
      const updates = action.payload
      const updatesId = updates.id
      if (updatesId) {
        const notification = state.notifications?.find(({ id }) => id === updatesId)
        if (notification) {
          Object.assign(notification, updates)
        }
      }
    },
    updateManyNotifications: (state, action: PayloadAction<Partial<TNotificationData>>) => {
      const updates = action.payload
      const notifications = state.notifications
      if (notifications && notifications.length > 0) {
        for (const notification of notifications) {
          Object.assign(notification, updates)
        }
      }
    },
    adjustUnreadCount: (state, action: PayloadAction<TNotificationUnreadChangeAmount>) => {
      state.unreadCount += action.payload
    },
  },
})

export const {
  setNotifications,
  addNotifications,
  setFilterResult,
  updateSingleNotification,
  updateManyNotifications,
  adjustUnreadCount,
} = notificationSlice.actions
