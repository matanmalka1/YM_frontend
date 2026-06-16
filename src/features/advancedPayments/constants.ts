import { makeLabelGetter, makeVariantGetter } from '@/utils/labels'
import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { MONTHS_COVERED_OPTIONS } from '@/constants/periodOptions.constants'
import { ALL_STATUSES_OPTION } from '@/constants/filterOptions.constants'
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
export const getAdvancePaymentStatusVariant = makeVariantGetter(ADVANCE_PAYMENT_STATUS_VARIANTS)

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
