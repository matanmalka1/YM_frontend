import { getAdvancePaymentStatusLabel, getAdvancePaymentMethodLabel } from '../../utils/enums'
import { MONTHS_COVERED_OPTIONS } from '@/constants/periodOptions.constants'
import { ALL_STATUSES_OPTION } from '@/constants/filterOptions.constants'
import type { AdvancePaymentMethod, AdvancePaymentStatus } from './types'

export const ADVANCE_PAYMENT_STATUS_FILTERS: AdvancePaymentStatus[] = ['pending', 'paid', 'partial']

export const ADVANCE_PAYMENT_STATUS_OPTIONS: { value: AdvancePaymentStatus; label: string }[] =
  ADVANCE_PAYMENT_STATUS_FILTERS.map((status) => ({
    value: status,
    label: getAdvancePaymentStatusLabel(status),
  }))

export const ADVANCE_PAYMENT_STATUS_OPTIONS_WITH_ALL: {
  value: AdvancePaymentStatus | ''
  label: string
}[] = [ALL_STATUSES_OPTION, ...ADVANCE_PAYMENT_STATUS_OPTIONS]

export const ADVANCE_PAYMENT_METHOD_OPTIONS: { value: AdvancePaymentMethod; label: string }[] = (
  ['bank_transfer', 'credit_card', 'check', 'direct_debit', 'cash', 'other'] as AdvancePaymentMethod[]
).map((method) => ({ value: method, label: getAdvancePaymentMethodLabel(method) }))

export const ADVANCE_PAYMENT_FREQUENCY_OPTIONS = MONTHS_COVERED_OPTIONS
