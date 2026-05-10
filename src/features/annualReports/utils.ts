import { differenceInCalendarDays } from 'date-fns'
import type { StageKey, TransitionForm } from './types'
import { parseAnnualReportCalendarDate } from './components/shared/annualReports.constants'

export const STAGE_ACCENT: Record<StageKey, string> = {
  material_collection: 'from-gray-400 to-gray-500',
  in_progress: 'from-primary-400 to-primary-500',
  final_review: 'from-info-400 to-info-500',
  client_signature: 'from-warning-400 to-warning-500',
  transmitted: 'from-positive-400 to-positive-500',
  post_submission: 'from-warning-400 to-warning-500',
}

export const TERMINAL_STATUSES = new Set(['submitted', 'accepted', 'closed'])

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
