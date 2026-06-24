import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { makeVariantGetter } from '@/utils/labels'
import {
  NOTIFICATION_STATUS_VALUES,
  NOTIFICATION_TRIGGER_VALUES,
  TRIGGER_LABELS,
  type NotificationStatus,
  type NotificationTrigger,
} from './api'

export const NOTIFICATION_TRIGGER_DOMAIN_LABELS: Partial<Record<NotificationTrigger, string>> = {
  binder_missing_documents: 'קלסר',
  binder_general_reminder: 'קלסר',
  invoice_issued: 'חיובים',
  payment_reminder: 'חיובים',
  vat_documents_reminder: 'מע"מ',
  annual_report_documents_request: 'דוח שנתי',
  annual_report_client_reminder: 'דוח שנתי',
  signature_request_sent: 'חתימה',
  signature_request_reminder: 'חתימה',
  client_missing_information: 'לקוח',
  client_documents_request: 'לקוח',
  client_general_message: 'לקוח',
}

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  pending: 'ממתינה',
  sent: 'נשלחה',
  failed: 'נכשלה',
  skipped: 'דולגה',
}

export const getNotificationStatusVariant = makeVariantGetter({
  pending: 'info',
  sent: 'positive',
  failed: 'negative',
  skipped: 'warning',
} satisfies Record<NotificationStatus, BadgeVariant>)

export const NOTIFICATION_TRIGGER_OPTIONS = [
  { value: '', label: 'כל הסוגים' },
  ...NOTIFICATION_TRIGGER_VALUES.map((trigger) => ({
    value: trigger,
    label: TRIGGER_LABELS[trigger],
  })),
]

export const NOTIFICATION_STATUS_OPTIONS = [
  { value: '', label: 'כל הסטטוסים' },
  ...NOTIFICATION_STATUS_VALUES.map((value) => ({ value, label: NOTIFICATION_STATUS_LABELS[value] })),
]

export const NOTIFICATION_DOMAIN_LABELS: Record<string, string> = {
  binders: 'קלסרים',
  charges: 'חיובים',
  vat: 'מע"מ',
  annual_reports: 'דוחות שנתיים',
  signatures: 'חתימות',
  clients: 'לקוחות',
}
