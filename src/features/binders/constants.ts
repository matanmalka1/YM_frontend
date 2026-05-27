import { makeLabelGetter } from '@/utils/labels'
import { ALL_STATUSES_OPTION } from '@/constants/filterOptions.constants'

export const BINDER_LOCATION_STATUS_VALUES = ['in_office', 'ready_for_handover', 'handed_over'] as const
export type BinderLocationStatusValue = (typeof BINDER_LOCATION_STATUS_VALUES)[number]

export const BINDER_CAPACITY_STATUS_VALUES = ['open', 'full'] as const
export type BinderCapacityStatusValue = (typeof BINDER_CAPACITY_STATUS_VALUES)[number]

export const BINDER_LOCATION_STATUS_LABELS: Record<BinderLocationStatusValue, string> = {
  in_office: 'במשרד',
  ready_for_handover: 'מוכן למסירה',
  handed_over: 'נמסר ללקוח',
}

export const BINDER_CAPACITY_STATUS_LABELS: Record<BinderCapacityStatusValue, string> = {
  open: 'פתוח',
  full: 'מלא',
}

export const getBinderLocationStatusLabel = makeLabelGetter(BINDER_LOCATION_STATUS_LABELS)
export const getBinderCapacityStatusLabel = makeLabelGetter(BINDER_CAPACITY_STATUS_LABELS)

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

export const BINDER_LOCATION_STATUS_VARIANTS: Record<
  BinderLocationStatusValue,
  'success' | 'warning' | 'error' | 'info' | 'neutral'
> = {
  in_office: 'info',
  ready_for_handover: 'success',
  handed_over: 'neutral',
}

export const BINDER_CAPACITY_STATUS_VARIANTS: Record<
  BinderCapacityStatusValue,
  'success' | 'warning' | 'error' | 'info' | 'neutral'
> = {
  open: 'success',
  full: 'warning',
}

export const BINDER_TYPE_OPTIONS: { value: string; label: string; disabled?: true }[] = [
  { value: '', label: 'בחר סוג חומר...', disabled: true },
  ...BINDER_TYPE_VALUES.map((value) => ({ value, label: BINDER_TYPE_LABELS[value] })),
]

export const BINDER_LOCATION_STATUS_OPTIONS: { value: string; label: string }[] = [
  ALL_STATUSES_OPTION,
  ...BINDER_LOCATION_STATUS_VALUES.map((value) => ({ value, label: BINDER_LOCATION_STATUS_LABELS[value] })),
]

export const BINDER_CAPACITY_STATUS_OPTIONS: { value: string; label: string }[] = [
  ALL_STATUSES_OPTION,
  ...BINDER_CAPACITY_STATUS_VALUES.map((value) => ({ value, label: BINDER_CAPACITY_STATUS_LABELS[value] })),
]
