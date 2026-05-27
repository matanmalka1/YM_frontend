// ── Enums ──────────────────────────────────────────────────────────────────────

export const NOTIFICATION_TRIGGER_VALUES = [
  'binder_ready_for_handover',
  'binder_missing_documents',
  'binder_general_reminder',
  'invoice_issued',
  'payment_reminder',
  'vat_documents_reminder',
  'annual_report_documents_request',
  'annual_report_client_reminder',
  'signature_request_sent',
  'signature_request_reminder',
  'client_missing_information',
  'client_documents_request',
  'client_general_message',
] as const

export type NotificationTrigger = (typeof NOTIFICATION_TRIGGER_VALUES)[number]

// Phase 1 triggers exposed in the manual send modal
export const PHASE1_TRIGGERS: NotificationTrigger[] = [
  'client_missing_information',
  'client_documents_request',
  'client_general_message',
  'binder_missing_documents',
  'binder_general_reminder',
]

export const TRIGGER_LABELS: Record<NotificationTrigger, string> = {
  binder_ready_for_handover: 'קלסר מוכן למסירה',
  binder_missing_documents: 'מסמכים חסרים בקלסר',
  binder_general_reminder: 'תזכורת כללית - קלסר',
  invoice_issued: 'חשבונית הונפקה',
  payment_reminder: 'תזכורת לתשלום',
  vat_documents_reminder: 'תזכורת מסמכי מע"מ',
  annual_report_documents_request: 'בקשת מסמכים לדוח שנתי',
  annual_report_client_reminder: 'תזכורת אישור דוח שנתי',
  signature_request_sent: 'בקשה לחתימה',
  signature_request_reminder: 'תזכורת לחתימה',
  client_missing_information: 'פרטים חסרים',
  client_documents_request: 'בקשת מסמכים',
  client_general_message: 'הודעה כללית',
}

export type NotificationChannel = 'email' | 'whatsapp'

// ── Read types ─────────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: number
  client_record_id: number
  client_name?: string | null
  business_id: number | null
  business_name?: string | null
  binder_id?: number | null
  annual_report_id?: number | null
  signature_request_id?: number | null
  entity_type?: string | null
  entity_id?: number | null
  trigger: NotificationTrigger
  trigger_label: string
  domain_label: string
  channel: NotificationChannel
  status: 'pending' | 'sent' | 'failed' | 'skipped'
  recipient?: string | null
  content_snapshot: string
  subject_snapshot?: string | null
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
  skipped: number
  total: number
}

export interface ListNotificationsParams {
  client_record_id?: number
  business_id?: number
  page?: number
  page_size?: 25 | 50
  status?: string
  trigger?: string
  channel?: string
  triggered_by?: number
  date_from?: string
  date_to?: string
}

// ── Preview / Send types ───────────────────────────────────────────────────────

export interface NotificationPreviewRequest {
  client_record_id: number
  trigger: NotificationTrigger
  entity_id?: number
  business_id?: number
  confirm_recent_duplicate?: boolean
}

export interface NotificationPreviewResponse {
  can_send: boolean
  status: 'ready' | 'blocked'
  reason?: string | null
  warnings: string[]
  recipient?: string | null
  subject?: string | null
  body?: string | null
}

export interface NotificationSendRequest {
  client_record_id: number
  trigger: NotificationTrigger
  subject: string
  body: string
  entity_id?: number
  business_id?: number
  idempotency_key?: string
  confirm_recent_duplicate?: boolean
}

export interface NotificationResult {
  status: 'sent' | 'failed' | 'skipped' | 'blocked'
  notification_id?: number | null
  reason?: string | null
  warnings: string[]
}
