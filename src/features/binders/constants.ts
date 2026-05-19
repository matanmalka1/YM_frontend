import { makeLabelGetter } from '@/utils/labels'
import { ALL_STATUSES_OPTION } from '@/constants/filterOptions.constants'

export const BINDER_STATUS_VALUES = ['in_office', 'closed_in_office', 'ready_for_pickup', 'returned'] as const
export type BinderStatusValue = (typeof BINDER_STATUS_VALUES)[number]

export const BINDER_STATUS_LABELS: Record<BinderStatusValue, string> = {
  in_office: 'במשרד',
  closed_in_office: 'סגור במשרד',
  ready_for_pickup: 'מוכן לאיסוף',
  returned: 'הוחזר',
}

export const getBinderStatusLabel = makeLabelGetter(BINDER_STATUS_LABELS)

export const BINDER_TYPE_VALUES = [
  'vat',
  'income_tax',
  'national_insurance',
  'capital_declaration',
  'annual_report',
  'salary',
  'bookkeeping',
  'pension_and_insurance',
  'corporate_docs',
  'tax_assessment',
  'other',
] as const
export type BinderTypeValue = (typeof BINDER_TYPE_VALUES)[number]

export const BINDER_TYPE_LABELS: Record<BinderTypeValue, string> = {
  vat: 'מע"מ',
  income_tax: 'מס הכנסה',
  national_insurance: 'ביטוח לאומי',
  capital_declaration: 'הצהרת הון',
  annual_report: 'דוח שנתי',
  salary: 'שכר',
  bookkeeping: 'הנהלת חשבונות',
  pension_and_insurance: 'פנסיה וביטוח',
  corporate_docs: 'מסמכי תאגיד',
  tax_assessment: 'שומות מס',
  other: 'אחר',
}

export const getBinderTypeLabel = makeLabelGetter(BINDER_TYPE_LABELS)

export const ANNUAL_BINDER_TYPES = new Set(['annual_report', 'capital_declaration'])
export const PERIODIC_BINDER_TYPES = new Set(['vat', 'salary'])

export const BINDER_STATUS_VARIANTS: Record<BinderStatusValue, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  in_office: 'info',
  closed_in_office: 'warning',
  ready_for_pickup: 'success',
  returned: 'neutral',
}

export const BINDER_TYPE_OPTIONS: { value: string; label: string; disabled?: true }[] = [
  { value: '', label: 'בחר סוג חומר...', disabled: true },
  ...BINDER_TYPE_VALUES.map((value) => ({ value, label: BINDER_TYPE_LABELS[value] })),
]

export const BINDER_STATUS_OPTIONS: { value: string; label: string }[] = [
  ALL_STATUSES_OPTION,
  ...BINDER_STATUS_VALUES.map((value) => ({ value, label: BINDER_STATUS_LABELS[value] })),
]
