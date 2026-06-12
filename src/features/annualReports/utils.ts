import { differenceInCalendarDays } from 'date-fns'
import type { TransitionForm } from './types'
import { parseAnnualReportCalendarDate } from './components/shared/annualReports.constants'

export const TERMINAL_STATUSES = new Set(['submitted', 'closed', 'canceled'])

export const daysUntil = (dateStr: string | null): number | null => {
  const deadline = parseAnnualReportCalendarDate(dateStr)
  if (!deadline) return null
  return differenceInCalendarDays(deadline, new Date())
}

type FlagFieldName = 'has_rental_income' | 'has_capital_gains' | 'has_foreign_income' | 'has_depreciation'

export const FLAG_FIELDS: { name: FlagFieldName; label: string }[] = [
  { name: 'has_rental_income', label: 'הכנסת שכירות (נספח ב)' },
  { name: 'has_capital_gains', label: 'רווחי הון (נספח בית)' },
  { name: 'has_foreign_income', label: 'הכנסות מחו"ל (נספח ג)' },
  { name: 'has_depreciation', label: 'פחת (נספח ד)' },
]

export const EMPTY_FORM: TransitionForm = {
  note: '',
  itaRef: '',
  submissionMethod: '',
  assessmentAmount: '',
  refundDue: '',
  taxDue: '',
}
