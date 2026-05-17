import { TAX_CALENDAR_OBLIGATION_LABELS } from './api'

export const TAX_CALENDAR_OBLIGATION_TYPE_OPTIONS = [
  { value: '', label: 'כל סוגי החובות' },
  { value: 'vat', label: TAX_CALENDAR_OBLIGATION_LABELS.vat },
  { value: 'advance_payment', label: TAX_CALENDAR_OBLIGATION_LABELS.advance_payment },
  { value: 'annual_report', label: TAX_CALENDAR_OBLIGATION_LABELS.annual_report },
]

export const TAX_CALENDAR_STATUS_OPTIONS = [
  { value: 'all', label: 'כל המצבים' },
  { value: 'open', label: 'פתוחים' },
  { value: 'overdue', label: 'באיחור' },
  { value: 'done', label: 'הושלמו' },
]
