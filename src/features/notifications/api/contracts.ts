export type NotificationSeverity = 'info' | 'warning' | 'urgent' | 'critical'

export interface NotificationItem {
  id: number
  client_record_id: number
  client_name?: string | null
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
  triggered_by?: number | null
  created_at: string
}

export interface NotificationListResponse {
  items: NotificationItem[]
  total: number
  page: number
  page_size: number
}

export interface NotificationSummaryResponse {
  pending: number
  sent: number
  failed: number
  total: number
}

export interface ListNotificationsParams {
  client_record_id?: number
  business_id?: number
  page?: number
  page_size?: number
  status?: string
  trigger?: string
  channel?: string
}

export type NotificationChannel = 'email' | 'whatsapp'

export interface ManualSendPayload {
  client_record_id: number
  business_id?: number
  preferred_channel: NotificationChannel
  message: string
}

export interface ManualSendResponse {
  ok: boolean
}
