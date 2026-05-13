import type { BadgeVariant } from '@/components/ui/primitives/Badge'

export const workQueueSourceTypeValues = [
  'vat_work_item',
  'annual_report',
  'advance_payment',
  'charge',
  'binder',
  'task',
] as const

export const workQueueUrgencyValues = ['overdue', 'approaching', 'important', 'upcoming'] as const

type WorkQueueSourceType = (typeof workQueueSourceTypeValues)[number]
type WorkQueueUrgency = (typeof workQueueUrgencyValues)[number]

export const workQueueSourceTypeLabels: Record<WorkQueueSourceType, string> = {
  vat_work_item: 'דוח מע"מ',
  annual_report: 'דוח שנתי',
  advance_payment: 'מקדמה',
  charge: 'חיוב לא שולם',
  binder: 'קלסר',
  task: 'משימה',
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
