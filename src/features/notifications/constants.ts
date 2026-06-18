import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { makeVariantGetter } from '@/utils/labels'
import { NOTIFICATION_STATUS_VALUES, NOTIFICATION_TRIGGER_VALUES, TRIGGER_LABELS, type NotificationStatus } from './api'

export const NOTIFICATIONS_PAGE_SIZE_OPTIONS = [
  { value: '25', label: '25' },
  { value: '50', label: '50' },
]

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
export const getNotificationStatusVariant = makeVariantGetter(NOTIFICATION_STATUS_VARIANTS)

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
