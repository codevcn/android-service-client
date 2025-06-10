// đã sửa xong file này

import { TSuccess } from "../utils/types"
import {
  apiCountUnreadNotifications,
  apiGetNotifications,
  apiMarkAllAsRead,
  apiMarkNotificationAsRead,
  apiTestNotify,
} from "./apis/notification-apis"
import type {
  TFetchNotificationsData,
  TNotificationData,
  TCountUnreadNotificationsData,
} from "./types"

type TUpdateNotificationPayload = { id: TNotificationData["id"] } & Partial<
  Omit<TNotificationData, "id">
>

class NotificationService {
  async fetchNotifications(): Promise<TFetchNotificationsData> {
    const { data } = await apiGetNotifications()
    if (!data) throw new Error("No notifications found")
    return {
      notifications: data.data?.map((notification) => ({
        id: notification.notificationId,
        description: notification.message,
        timestamp: notification.createdAt,
        seen: notification.read,
        type: notification.type,
        action: notification.action,
        projectId: notification.projectId,
        senderId: notification.senderId,
      })),
    }
  }

  async updateNotification(updatesPayload: TUpdateNotificationPayload): Promise<TSuccess> {
    const { id, seen } = updatesPayload
    if (seen) {
      await apiMarkNotificationAsRead({ notificationId: id })
    }
    return { success: true }
  }

  async markAllAsRead(): Promise<TSuccess> {
    await apiMarkAllAsRead()
    return { success: true }
  }

  // đã bỏ
  // async loadMoreNotifications(lastId: number): Promise<TFetchNotificationsData> {
  //   await perfomDelay(1000)
  //   return {
  //     notifications: notifications.map((obj) => ({
  //       ...obj,
  //       id:
  //         Math.random() +
  //         Math.random() +
  //         Math.random() +
  //         Math.random() +
  //         Math.random() +
  //         Math.random(),
  //     })),
  //   }
  // }

  async countUnreadNotifcations(): Promise<TCountUnreadNotificationsData> {
    const { data } = await apiCountUnreadNotifications()
    return { count: data.data.count }
  }

  async testNotify(): Promise<void> {
    await apiTestNotify()
  }
}

export const notificationService = new NotificationService()
