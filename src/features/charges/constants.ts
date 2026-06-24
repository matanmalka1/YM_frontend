import { makeLabelGetter } from '@/utils/labels'
import { ALL_STATUSES_OPTION, ALL_TYPES_OPTION } from '@/constants/filterOptions.constants'
import { PERIOD_PATTERN } from '@/constants/periodOptions.constants'
import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import type { ChargeListStats, ChargeStatusStat } from './api'
import { CHARGES_MESSAGES } from './messages'

export { PERIOD_PATTERN as CHARGE_PERIOD_PATTERN }

/** @auditContract Read by the backend enum-sync audit. */
export const CHARGE_STATUS_VALUES = ['draft', 'issued', 'paid', 'canceled'] as const
export type ChargeStatusValue = (typeof CHARGE_STATUS_VALUES)[number]

export const CHARGE_STATUS_LABELS: Record<ChargeStatusValue, string> = {
  draft: CHARGES_MESSAGES.status.draft,
  issued: CHARGES_MESSAGES.status.issued,
  paid: CHARGES_MESSAGES.status.paid,
  canceled: CHARGES_MESSAGES.status.canceled,
}
export const getChargeStatusLabel = makeLabelGetter(CHARGE_STATUS_LABELS)

export const chargeStatusVariants: Record<ChargeStatusValue, BadgeVariant> = {
  draft: 'neutral',
  issued: 'info',
  paid: 'positive',
  canceled: 'negative',
}

export const CHARGE_TYPE_VALUES = [
  'monthly_retainer',
  'annual_report_fee',
  'vat_filing_fee',
  'representation_fee',
  'consultation_fee',
  'other',
] as const
export type ChargeTypeValue = (typeof CHARGE_TYPE_VALUES)[number]

export const CHARGE_TYPE_LABELS: Record<ChargeTypeValue, string> = {
  monthly_retainer: CHARGES_MESSAGES.types.monthlyRetainer,
  annual_report_fee: CHARGES_MESSAGES.types.annualReportFee,
  vat_filing_fee: CHARGES_MESSAGES.types.vatFilingFee,
  representation_fee: CHARGES_MESSAGES.types.representationFee,
  consultation_fee: CHARGES_MESSAGES.types.consultationFee,
  other: CHARGES_MESSAGES.types.other,
}
export const getChargeTypeLabel = makeLabelGetter(CHARGE_TYPE_LABELS)

export const CHARGE_CREATE_FORM_ID = 'charges-create-form'
export const CHARGE_CANCEL_REASON_PLACEHOLDER = CHARGES_MESSAGES.detail.cancelReasonPlaceholder
export const CHARGE_PERIOD_YEAR_SPAN = 1

const DEFAULT_CHARGE_STATUS_STAT: ChargeStatusStat = { count: 0, amount: '0' }

export const DEFAULT_CHARGE_LIST_STATS: ChargeListStats = {
  draft: DEFAULT_CHARGE_STATUS_STAT,
  issued: DEFAULT_CHARGE_STATUS_STAT,
  paid: DEFAULT_CHARGE_STATUS_STAT,
  canceled: DEFAULT_CHARGE_STATUS_STAT,
}

export const CHARGE_STATUS_OPTIONS: { value: string; label: string }[] = [
  ALL_STATUSES_OPTION,
  ...CHARGE_STATUS_VALUES.map((status) => ({ value: status, label: CHARGE_STATUS_LABELS[status] })),
]

export const CHARGE_TYPE_OPTIONS: { value: string; label: string }[] = CHARGE_TYPE_VALUES.map((value) => ({
  value,
  label: CHARGE_TYPE_LABELS[value],
}))

export const CHARGE_TYPE_OPTIONS_WITH_ALL: { value: string; label: string }[] = [
  ALL_TYPES_OPTION,
  ...CHARGE_TYPE_OPTIONS,
]

const _currentYear = new Date().getFullYear()
const _MONTH_LABELS = [
  CHARGES_MESSAGES.periods.january,
  CHARGES_MESSAGES.periods.february,
  CHARGES_MESSAGES.periods.march,
  CHARGES_MESSAGES.periods.april,
  CHARGES_MESSAGES.periods.may,
  CHARGES_MESSAGES.periods.june,
  CHARGES_MESSAGES.periods.july,
  CHARGES_MESSAGES.periods.august,
  CHARGES_MESSAGES.periods.september,
  CHARGES_MESSAGES.periods.october,
  CHARGES_MESSAGES.periods.november,
  CHARGES_MESSAGES.periods.december,
]

export const CHARGE_PERIOD_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: CHARGES_MESSAGES.periods.all },
  ...Array.from(
    { length: CHARGE_PERIOD_YEAR_SPAN * 2 + 1 },
    (_, i) => _currentYear - CHARGE_PERIOD_YEAR_SPAN + i,
  ).flatMap((year) =>
    Array.from({ length: 12 }, (_, m) => ({
      value: `${year}-${String(m + 1).padStart(2, '0')}`,
      label: `${_MONTH_LABELS[m]} ${year}`,
    })),
  ),
]
