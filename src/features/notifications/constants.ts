import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { makeLabelGetter, makeVariantGetter } from '@/utils/labels'
import { NOTIFICATION_STATUS_VALUES, type NotificationStatus } from './api'

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  pending: 'ממתינה',
  sent: 'נשלחה',
  failed: 'נכשלה',
  skipped: 'דולגה',
}

export const getNotificationStatusLabel = makeLabelGetter(NOTIFICATION_STATUS_LABELS)

export const getNotificationStatusVariant = makeVariantGetter({
  pending: 'info',
  sent: 'positive',
  failed: 'negative',
  skipped: 'warning',
} satisfies Record<NotificationStatus, BadgeVariant>)

export const NOTIFICATION_STATUS_OPTIONS = [
  { value: '', label: 'כל הסטטוסים' },
  ...NOTIFICATION_STATUS_VALUES.map((value) => ({ value, label: NOTIFICATION_STATUS_LABELS[value] })),
]
