import { makeLabelGetter, makeVariantGetter } from '@/utils/labels'
import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { ALL_STATUSES_OPTION } from '@/constants/filterOptions.constants'

const BINDER_LOCATION_STATUS_VALUES = ['in_office', 'ready_for_handover', 'handed_over'] as const
export type BinderLocationStatus = (typeof BINDER_LOCATION_STATUS_VALUES)[number]

const BINDER_CAPACITY_STATUS_VALUES = ['open', 'full'] as const
export type BinderCapacityStatus = (typeof BINDER_CAPACITY_STATUS_VALUES)[number]

const BINDER_SORT_BY_VALUES = [
  'period_start',
  'days_in_office',
  'location_status',
  'capacity_status',
  'client_name',
] as const
export type BinderSortBy = (typeof BINDER_SORT_BY_VALUES)[number]

const BINDER_SORT_ORDER_VALUES = ['asc', 'desc'] as const
export type BinderSortOrder = (typeof BINDER_SORT_ORDER_VALUES)[number]

export const isBinderLocationStatus = (value: unknown): value is BinderLocationStatus =>
  typeof value === 'string' && BINDER_LOCATION_STATUS_VALUES.includes(value as BinderLocationStatus)

export const isBinderCapacityStatus = (value: unknown): value is BinderCapacityStatus =>
  typeof value === 'string' && BINDER_CAPACITY_STATUS_VALUES.includes(value as BinderCapacityStatus)

export const isBinderSortBy = (value: unknown): value is BinderSortBy =>
  typeof value === 'string' && BINDER_SORT_BY_VALUES.includes(value as BinderSortBy)

export const isBinderSortOrder = (value: unknown): value is BinderSortOrder =>
  typeof value === 'string' && BINDER_SORT_ORDER_VALUES.includes(value as BinderSortOrder)

export const BINDER_LOCATION_STATUS_LABELS: Record<BinderLocationStatus, string> = {
  in_office: 'במשרד',
  ready_for_handover: 'מוכן למסירה',
  handed_over: 'נמסר ללקוח',
}

export const BINDER_CAPACITY_STATUS_LABELS: Record<BinderCapacityStatus, string> = {
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

const BINDER_TYPE_LABELS: Record<BinderTypeValue, string> = {
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

export const ANNUAL_BINDER_TYPES = new Set<BinderTypeValue>(['annual_report', 'capital_declaration'])
export const PERIODIC_BINDER_TYPES = new Set<BinderTypeValue>(['vat', 'salary'])

export const BINDER_LOCATION_STATUS_VARIANTS: Record<BinderLocationStatus, BadgeVariant> = {
  in_office: 'info',
  ready_for_handover: 'positive',
  handed_over: 'neutral',
}
export const getBinderLocationStatusVariant = makeVariantGetter(BINDER_LOCATION_STATUS_VARIANTS)

export const BINDER_CAPACITY_STATUS_VARIANTS: Record<BinderCapacityStatus, BadgeVariant> = {
  open: 'positive',
  full: 'warning',
}
export const getBinderCapacityStatusVariant = makeVariantGetter(BINDER_CAPACITY_STATUS_VARIANTS)

export const BINDER_TYPE_OPTIONS: { value: string; label: string; disabled?: true }[] = [
  { value: '', label: 'בחר סוג חומר...', disabled: true },
  ...BINDER_TYPE_VALUES.map((value) => ({ value, label: BINDER_TYPE_LABELS[value] })),
]

export const BINDER_LOCATION_STATUS_OPTIONS: { value: string; label: string }[] = [
  ALL_STATUSES_OPTION,
  ...BINDER_LOCATION_STATUS_VALUES.map((value) => ({ value, label: BINDER_LOCATION_STATUS_LABELS[value] })),
]

export const BINDER_CAPACITY_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'כל מצבי הקיבולת' },
  ...BINDER_CAPACITY_STATUS_VALUES.map((value) => ({ value, label: BINDER_CAPACITY_STATUS_LABELS[value] })),
]
