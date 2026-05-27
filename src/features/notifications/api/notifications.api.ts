import { api } from '@/api/client'
import { NOTIFICATION_ENDPOINTS } from './endpoints'
import { toQueryParams } from '@/api/queryParams'
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationSummaryResponse,
  ListNotificationsParams,
  NotificationPreviewRequest,
  NotificationPreviewResponse,
  NotificationSendRequest,
  NotificationResult,
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

  getSummary: async (clientId?: number): Promise<NotificationSummaryResponse> => {
    const response = await api.get<NotificationSummaryResponse>(
      NOTIFICATION_ENDPOINTS.notificationsSummary,
      clientId != null ? { params: toQueryParams({ client_record_id: clientId }) } : undefined,
    )
    return response.data
  },

  preview: async (payload: NotificationPreviewRequest): Promise<NotificationPreviewResponse> => {
    const response = await api.post<NotificationPreviewResponse>(
      NOTIFICATION_ENDPOINTS.notificationsPreview,
      payload,
    )
    return response.data
  },

  send: async (payload: NotificationSendRequest): Promise<NotificationResult> => {
    const response = await api.post<NotificationResult>(NOTIFICATION_ENDPOINTS.notificationsSend, payload)
    return response.data
  },
}
