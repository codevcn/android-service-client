import { clientAxios } from "../../configs/api-configs"
import type { TNotificationIdParam } from "./types/input-types"
import type {
  TNotificationResponse,
  TNotificationsResponse,
  TMessageResponse,
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
