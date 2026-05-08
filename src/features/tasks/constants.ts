import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import type { TaskType, TaskUrgency } from './api/contracts'

export const taskTypeValues = [
  'vat_filing',
  'annual_report',
  'advance_payment',
  'unpaid_charge',
] as const

export const taskUrgencyValues = ['overdue', 'approaching', 'upcoming'] as const

export const taskTypeLabels: Record<TaskType, string> = {
  vat_filing: 'דוח מע"מ',
  annual_report: 'דוח שנתי',
  advance_payment: 'מקדמה',
  unpaid_charge: 'חיוב לא שולם',
}

export const taskUrgencyLabels: Record<TaskUrgency, string> = {
  overdue: 'באיחור',
  approaching: 'מתקרב',
  upcoming: 'קרוב',
}

export const taskUrgencyVariant: Record<TaskUrgency, BadgeVariant> = {
  overdue: 'error',
  approaching: 'warning',
  upcoming: 'info',
}
