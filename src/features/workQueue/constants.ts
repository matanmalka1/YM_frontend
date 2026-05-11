import type { BadgeVariant } from '@/components/ui/primitives/Badge'

export const workQueueSourceTypeValues = [
  'vat_filing',
  'annual_report',
  'advance_payment',
  'unpaid_charge',
  'task',
  'stale_binder',
] as const

export const workQueueUrgencyValues = ['overdue', 'approaching', 'important', 'upcoming'] as const

type WorkQueueSourceType = (typeof workQueueSourceTypeValues)[number]
type WorkQueueUrgency = (typeof workQueueUrgencyValues)[number]

export const workQueueSourceTypeLabels: Record<WorkQueueSourceType, string> = {
  vat_filing: 'דוח מע"מ',
  annual_report: 'דוח שנתי',
  advance_payment: 'מקדמה',
  unpaid_charge: 'חיוב לא שולם',
  task: 'משימה',
  stale_binder: 'קלסר',
}

export const workQueueUrgencyLabels: Record<WorkQueueUrgency, string> = {
  overdue: 'באיחור',
  approaching: 'דחוף',
  important: 'חשוב',
  upcoming: 'קרוב',
}

export const workQueueUrgencyVariant: Record<WorkQueueUrgency, BadgeVariant> = {
  overdue: 'error',
  approaching: 'warning',
  important: 'warning',
  upcoming: 'info',
}
