import { api } from '@/api/client'
import { NOTIFICATION_ENDPOINTS } from './endpoints'
import { toQueryParams } from '@/api/queryParams'
import type {
  NotificationItem,
  NotificationListResponse,
  UnreadCountResponse,
  ListNotificationsParams,
  ManualSendPayload,
  ManualSendResponse,
} from './contracts'

const normalizeNotifications = (data: NotificationItem[] | NotificationListResponse): NotificationItem[] => {
  if (Array.isArray(data)) return data
  return Array.isArray(data.items) ? data.items : []
}

export const notificationsApi = {
  list: async (params?: ListNotificationsParams): Promise<NotificationItem[]> => {
    const response = await api.get<NotificationItem[] | NotificationListResponse>(
      NOTIFICATION_ENDPOINTS.notifications,
      params ? { params: toQueryParams(params) } : undefined,
    )
    return normalizeNotifications(response.data)
  },

  getUnreadCount: async (clientId?: number): Promise<UnreadCountResponse> => {
    const response = await api.get<UnreadCountResponse>(
      NOTIFICATION_ENDPOINTS.notificationsUnreadCount,
      clientId != null ? { params: toQueryParams({ client_record_id: clientId }) } : undefined,
    )
    return response.data
  },

  send: async (payload: ManualSendPayload): Promise<ManualSendResponse> => {
    const response = await api.post<ManualSendResponse>(NOTIFICATION_ENDPOINTS.notificationsSend, payload)
    return response.data
  },
}
