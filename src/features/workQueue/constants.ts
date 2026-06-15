import type { BadgeVariant } from '@/components/ui/primitives/Badge'

export const APPROACHING_DAYS = 7
export const IMPORTANT_DAYS = 21

export const workQueueSourceTypeValues = [
  'vat_work_item',
  'annual_report',
  'advance_payment',
  'charge',
  'binder',
  'task',
] as const

export const workQueueUrgencyValues = ['overdue', 'approaching', 'important', 'upcoming'] as const

export type WorkQueueSourceType = (typeof workQueueSourceTypeValues)[number]

export type WorkQueueUrgency = (typeof workQueueUrgencyValues)[number]

export const isWorkQueueSourceType = (value: string | null): value is WorkQueueSourceType =>
  value !== null && workQueueSourceTypeValues.includes(value as WorkQueueSourceType)

export const parseWorkQueueSourceType = (value: string | null): WorkQueueSourceType | null =>
  isWorkQueueSourceType(value) ? value : null

export const isWorkQueueUrgency = (value: string | null): value is WorkQueueUrgency =>
  value !== null && workQueueUrgencyValues.includes(value as WorkQueueUrgency)

export const parseWorkQueueUrgency = (value: string | null): WorkQueueUrgency | null =>
  isWorkQueueUrgency(value) ? value : null

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
