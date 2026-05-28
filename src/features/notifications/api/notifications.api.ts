import { api } from '@/api/client'
import { NOTIFICATION_ENDPOINTS } from './endpoints'
import { toQueryParams } from '@/api/queryParams'
import type {
  NotificationListResponse,
  NotificationSummaryResponse,
  ListNotificationsParams,
  NotificationPreviewRequest,
  NotificationPreviewResponse,
  NotificationSendRequest,
  NotificationResult,
} from './contracts'

export const notificationsApi = {
  listPaginated: async (params: ListNotificationsParams = {}): Promise<NotificationListResponse> => {
    const response = await api.get<NotificationListResponse>(
      NOTIFICATION_ENDPOINTS.notifications,
      params ? { params: toQueryParams(params) } : undefined,
    )
    return response.data
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

  send: async (payload: NotificationSendRequest, idempotencyKey: string): Promise<NotificationResult> => {
    const response = await api.post<NotificationResult>(
      NOTIFICATION_ENDPOINTS.notificationsSend,
      payload,
      {
        headers: {
          'X-Idempotency-Key': idempotencyKey,
        },
      },
    )
    return response.data
  },
}
