import { makeLabelGetter } from '@/utils/labels'
import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import {
  getOperationalTaxYear,
  getOperationalYearOptions,
  MONTHS_COVERED_OPTIONS,
} from '@/constants/periodOptions.constants'
import { ALL_STATUSES_OPTION, ALL_TYPES_OPTION, ALL_YEARS_URL_OPTION } from '@/constants/filterOptions.constants'
import type { AdvancePaymentMethod, AdvancePaymentStatus } from './api/contracts'

const ADVANCE_PAYMENT_STATUS_VALUES = ['pending', 'paid', 'partial'] as const satisfies readonly AdvancePaymentStatus[]
const ADVANCE_PAYMENT_STATUS_VALUE_SET = new Set<string>(ADVANCE_PAYMENT_STATUS_VALUES)
const ADVANCE_PAYMENT_STATUS_LABELS: Record<AdvancePaymentStatus, string> = {
  pending: 'ממתין',
  paid: 'שולם',
  partial: 'חלקי',
}
export const getAdvancePaymentStatusLabel = makeLabelGetter(ADVANCE_PAYMENT_STATUS_LABELS)

export const ADVANCE_PAYMENT_STATUS_VARIANTS: Record<AdvancePaymentStatus, BadgeVariant> = {
  paid: 'success',
  partial: 'warning',
  pending: 'neutral',
}

const ADVANCE_PAYMENT_METHOD_VALUES = [
  'bank_transfer',
  'credit_card',
  'check',
  'direct_debit',
  'cash',
  'other',
] as const satisfies readonly AdvancePaymentMethod[]
const ADVANCE_PAYMENT_METHOD_LABELS: Record<AdvancePaymentMethod, string> = {
  bank_transfer: 'העברה בנקאית',
  credit_card: 'כרטיס אשראי',
  check: "צ'ק",
  direct_debit: 'הוראת קבע',
  cash: 'מזומן',
  other: 'אחר',
}

export const ADVANCE_PAYMENT_STATUS_FILTERS: AdvancePaymentStatus[] = [...ADVANCE_PAYMENT_STATUS_VALUES]

export const isAdvancePaymentStatus = (value: string): value is AdvancePaymentStatus =>
  ADVANCE_PAYMENT_STATUS_VALUE_SET.has(value)

export const ADVANCE_PAYMENT_STATUS_OPTIONS: { value: AdvancePaymentStatus; label: string }[] =
  ADVANCE_PAYMENT_STATUS_VALUES.map((status) => ({ value: status, label: ADVANCE_PAYMENT_STATUS_LABELS[status] }))

export const ADVANCE_PAYMENT_STATUS_OPTIONS_WITH_ALL: {
  value: AdvancePaymentStatus | ''
  label: string
}[] = [ALL_STATUSES_OPTION, ...ADVANCE_PAYMENT_STATUS_OPTIONS]

export const ADVANCE_PAYMENT_METHOD_OPTIONS: { value: AdvancePaymentMethod; label: string }[] =
  ADVANCE_PAYMENT_METHOD_VALUES.map((method) => ({ value: method, label: ADVANCE_PAYMENT_METHOD_LABELS[method] }))

export const ADVANCE_PAYMENT_FREQUENCY_OPTIONS = MONTHS_COVERED_OPTIONS

export const ADVANCE_PAYMENT_FREQUENCY_PREFIX = 'תדירות מקדמות:'
export const ADVANCE_PAYMENT_FREQUENCY_UNSET_TEXT = 'תדירות מקדמות לא הוגדרה'

const PERIOD_OPTIONS = [ALL_TYPES_OPTION, ...MONTHS_COVERED_OPTIONS]
const YEAR_OPTIONS = [ALL_YEARS_URL_OPTION, ...getOperationalYearOptions()]

export const ADVANCE_PAYMENTS_FILTER_FIELDS = [
  { type: 'client-picker' as const, idKey: 'client_record_id', nameKey: 'client_name', label: 'לקוח' },
  {
    type: 'select' as const,
    key: 'year',
    label: 'שנה',
    options: YEAR_OPTIONS,
    defaultValue: String(getOperationalTaxYear()),
  },
  {
    type: 'select' as const,
    key: 'status',
    label: 'סטטוס',
    options: ADVANCE_PAYMENT_STATUS_OPTIONS_WITH_ALL,
  },
  { type: 'select' as const, key: 'period', label: 'תקופת מקדמה', options: PERIOD_OPTIONS },
]

const HEADER_BASE_CLASS = 'px-3 py-1.5 text-xs font-semibold text-gray-400 align-middle'

export const ADVANCE_PAYMENT_BATCH_COLUMN_COUNT = 11

export const ADVANCE_PAYMENT_BATCH_TABLE_HEADERS = [
  { label: 'מס׳', className: `${HEADER_BASE_CLASS} px-4 text-right w-16` },
  { label: 'שם לקוח', className: `${HEADER_BASE_CLASS} text-right w-48` },
  { label: 'תקופת מקדמה', className: `${HEADER_BASE_CLASS} text-right w-28` },
  { label: 'תאריך יעד', className: `${HEADER_BASE_CLASS} text-right w-24` },
  { label: 'מחזור מדווח', className: `${HEADER_BASE_CLASS} text-center w-24` },
  { label: 'צפוי', className: `${HEADER_BASE_CLASS} text-center w-20` },
  { label: 'שולם', className: `${HEADER_BASE_CLASS} text-center w-20` },
  { label: 'יתרה', className: `${HEADER_BASE_CLASS} text-center w-20` },
  { label: 'אחוז מקדמה', className: `${HEADER_BASE_CLASS} text-center w-20` },
  { label: 'סטטוס', className: `${HEADER_BASE_CLASS} text-center w-24` },
  { label: '', className: 'px-3 py-1.5 align-middle w-10' },
] as const
