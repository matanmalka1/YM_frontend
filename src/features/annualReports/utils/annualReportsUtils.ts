import type { TransitionForm } from '../types'

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
