import { makeLabelGetter } from '@/utils/labels'
import type { BusinessStatus } from '@/features/clients'
import { BUSINESSES_MESSAGES } from './messages'

export const BUSINESS_STATUS_LABELS: Record<BusinessStatus, string> = {
  active: 'פעיל',
  frozen: 'מוקפא',
  closed: 'סגור',
}

export const getBusinessStatusLabel = makeLabelGetter(BUSINESS_STATUS_LABELS)

export const BUSINESS_STATUS_BADGE_VARIANTS = {
  active: 'positive',
  frozen: 'warning',
  closed: 'neutral',
} as const satisfies Record<BusinessStatus, 'positive' | 'warning' | 'neutral'>

export const BUSINESS_STATUS_OPTIONS = (Object.keys(BUSINESS_STATUS_LABELS) as BusinessStatus[]).map((status) => ({
  value: status,
  label: BUSINESS_STATUS_LABELS[status],
}))

export const BUSINESS_DETAILS_COPY = BUSINESSES_MESSAGES.details
