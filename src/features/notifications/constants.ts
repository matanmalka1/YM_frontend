import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { makeVariantGetter } from '@/utils/labels'
import { NOTIFICATION_STATUS_VALUES, NOTIFICATION_TRIGGER_VALUES, TRIGGER_LABELS, type NotificationStatus } from './api'

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
