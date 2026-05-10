export type NotificationSeverity = 'info' | 'warning' | 'urgent' | 'critical'

export interface NotificationItem {
  id: number
  client_record_id: number
  business_id: number | null
  business_name?: string | null
  binder_id?: number | null
  trigger: string
  channel: string
  status: string
  severity: NotificationSeverity
  recipient?: string | null
  content_snapshot: string
  sent_at?: string | null
  failed_at?: string | null
  error_message?: string | null
  retry_count?: number
  is_read: boolean
  read_at: string | null
  triggered_by?: number | null
  created_at: string
}

export interface NotificationListResponse {
  items: NotificationItem[]
  total: number
  page: number
  page_size: number
}

export interface UnreadCountResponse {
  unread_count: number
}

export interface MarkReadResponse {
  updated: number
}

export interface ListNotificationsParams {
  client_record_id?: number
  business_id?: number
  page?: number
  page_size?: number
}

export interface SendNotificationPayload {
  business_id: number
  channel: 'whatsapp' | 'email'
  message: string
  severity?: string
}

export interface SendNotificationResponse {
  ok: boolean
}
