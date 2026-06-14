import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { FIRST_PAGE } from '@/constants/pagination.constants'
import { MANUAL_NOTIFICATION_TRIGGERS, TRIGGER_LABELS, type NotificationStatus } from '@/features/notifications/api'

export const NOTIFICATIONS_PAGE_SIZE_OPTIONS = [
  { value: '25', label: '25' },
  { value: '50', label: '50' },
]

export const NOTIFICATIONS_USER_FILTER_PARAMS = {
  page: FIRST_PAGE,
  page_size: 100,
}

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  pending: 'ממתינה',
  sent: 'נשלחה',
  failed: 'נכשלה',
  skipped: 'דולגה',
}

export const NOTIFICATION_STATUS_VARIANTS: Record<NotificationStatus, BadgeVariant> = {
  pending: 'info',
  sent: 'success',
  failed: 'error',
  skipped: 'warning',
}

export const NOTIFICATION_TRIGGER_OPTIONS = [
  { value: '', label: 'כל הסוגים' },
  ...MANUAL_NOTIFICATION_TRIGGERS.map((trigger) => ({
    value: trigger,
    label: TRIGGER_LABELS[trigger],
  })),
]

export const NOTIFICATION_STATUS_OPTIONS = [
  { value: '', label: 'כל הסטטוסים' },
  ...Object.entries(NOTIFICATION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

export const NOTIFICATION_DOMAIN_LABELS: Record<string, string> = {
  binders: 'קלסרים',
  charges: 'חיובים',
  vat: 'מע"מ',
  annual_reports: 'דוחות שנתיים',
  signatures: 'חתימות',
  clients: 'לקוחות',
}
