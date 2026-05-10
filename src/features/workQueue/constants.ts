import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import type { WorkQueueSourceType, WorkQueueUrgency } from './api/contracts'

export const workQueueSourceTypeValues = ['vat_filing', 'annual_report', 'advance_payment', 'unpaid_charge', 'task'] as const

export const workQueueUrgencyValues = ['overdue', 'approaching', 'upcoming'] as const

export const workQueueSourceTypeLabels: Record<WorkQueueSourceType, string> = {
  vat_filing: 'דוח מע"מ',
  annual_report: 'דוח שנתי',
  advance_payment: 'מקדמה',
  unpaid_charge: 'חיוב לא שולם',
  task: 'משימה',
}

export const workQueueUrgencyLabels: Record<WorkQueueUrgency, string> = {
  overdue: 'באיחור',
  approaching: 'מתקרב',
  upcoming: 'קרוב',
}

export const workQueueUrgencyVariant: Record<WorkQueueUrgency, BadgeVariant> = {
  overdue: 'error',
  approaching: 'warning',
  upcoming: 'info',
}
