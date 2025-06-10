import { clientAxios } from "../../configs/api-configs"
import type { TNotificationIdParam } from "./types/input-types"
import type {
  TNotificationResponse,
  TNotificationsResponse,
  TMessageResponse,
  TCountUnreadNotificationsResponse,
} from "./types/output-types"

export const apiGetNotifications = async (): Promise<TNotificationsResponse> =>
  clientAxios.get("/notifications")

export const apiMarkNotificationAsRead = async ({
  notificationId,
}: TNotificationIdParam): Promise<TNotificationResponse> =>
  clientAxios.put(`/notifications/${notificationId}/read`)

export const apiDeleteNotification = async ({
  notificationId,
}: TNotificationIdParam): Promise<TMessageResponse> =>
  clientAxios.delete(`/notifications/${notificationId}`)

export const apiTestNotify = async (): Promise<TMessageResponse> =>
  clientAxios.post(`/notifications/test-notify`, {}, { params: { userId: 4 } })

export const apiCountUnreadNotifications = async (): Promise<TCountUnreadNotificationsResponse> =>
  clientAxios.get(`/notifications/count-unread`)

export const apiMarkAllAsRead = async (): Promise<TMessageResponse> =>
  clientAxios.put(`/notifications/mark-all-as-read`)
