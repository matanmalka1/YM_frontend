import type { TaxCalendarObligationType, TaxCalendarGroupItemSourceType } from './api'
import { TAX_CALENDAR_MESSAGES } from './messages'

export const TAX_CALENDAR_OBLIGATION_TYPES = [
  'vat',
  'advance_payment',
  'annual_report',
] as const satisfies readonly TaxCalendarObligationType[]

export const TAX_CALENDAR_OBLIGATION_LABELS: Record<TaxCalendarObligationType, string> = {
  vat: TAX_CALENDAR_MESSAGES.obligations.vat,
  advance_payment: TAX_CALENDAR_MESSAGES.obligations.advancePayment,
  annual_report: TAX_CALENDAR_MESSAGES.obligations.annualReport,
}

export const TAX_CALENDAR_GROUP_STATUSES = ['all', 'open', 'overdue', 'done'] as const

export type TaxCalendarGroupStatusFilter = (typeof TAX_CALENDAR_GROUP_STATUSES)[number]

export const TAX_CALENDAR_OBLIGATION_TYPE_OPTIONS = [
  { value: '', label: TAX_CALENDAR_MESSAGES.filters.allObligationTypes },
  ...TAX_CALENDAR_OBLIGATION_TYPES.map((value) => ({
    value,
    label: TAX_CALENDAR_OBLIGATION_LABELS[value],
  })),
]

const TAX_CALENDAR_STATUS_LABELS: Record<TaxCalendarGroupStatusFilter, string> = {
  all: TAX_CALENDAR_MESSAGES.status.all,
  open: TAX_CALENDAR_MESSAGES.status.open,
  overdue: TAX_CALENDAR_MESSAGES.status.overdue,
  done: TAX_CALENDAR_MESSAGES.status.done,
}

export const TAX_CALENDAR_STATUS_OPTIONS = TAX_CALENDAR_GROUP_STATUSES.map((value) => ({
  value,
  label: TAX_CALENDAR_STATUS_LABELS[value],
}))

export const TAX_CALENDAR_SOURCE_TYPE_LABELS: Record<TaxCalendarGroupItemSourceType, string> = {
  vat_work_item: TAX_CALENDAR_MESSAGES.item.vat,
  advance_payment: TAX_CALENDAR_MESSAGES.item.advancePayment,
  annual_report: TAX_CALENDAR_MESSAGES.item.annualReport,
}
