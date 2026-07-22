import type { TaxCalendarObligationType } from './api'
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
