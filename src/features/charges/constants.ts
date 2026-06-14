import { makeLabelGetter } from '@/utils/labels'
import { ALL_STATUSES_OPTION, ALL_TYPES_OPTION } from '@/constants/filterOptions.constants'
import { PERIOD_PATTERN } from '@/constants/periodOptions.constants'
import type { ChargeListStats, ChargeStatusStat } from './api'

export { PERIOD_PATTERN as CHARGE_PERIOD_PATTERN }

/** @auditContract Read by the backend enum-sync audit. */
export const CHARGE_STATUS_VALUES = ['draft', 'issued', 'paid', 'canceled'] as const
export type ChargeStatusValue = (typeof CHARGE_STATUS_VALUES)[number]

export const CHARGE_STATUS_LABELS: Record<ChargeStatusValue, string> = {
  draft: 'טיוטה',
  issued: 'הונפק',
  paid: 'שולם',
  canceled: 'בוטל',
}
export const getChargeStatusLabel = makeLabelGetter(CHARGE_STATUS_LABELS)

export const chargeStatusVariants: Record<ChargeStatusValue, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  draft: 'neutral',
  issued: 'info',
  paid: 'success',
  canceled: 'error',
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
  monthly_retainer: 'ריטיינר חודשי',
  annual_report_fee: 'שכר טרחה לדוח שנתי',
  vat_filing_fee: 'שכר טרחה לדוח מע״מ',
  representation_fee: 'שכר טרחה לייצוג',
  consultation_fee: 'שכר טרחה לייעוץ',
  other: 'אחר',
}
export const getChargeTypeLabel = makeLabelGetter(CHARGE_TYPE_LABELS)

export const CHARGE_CREATE_FORM_ID = 'charges-create-form'
export const CHARGE_CANCEL_REASON_PLACEHOLDER = 'סיבת ביטול (אופציונלי)'
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
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
]

export const CHARGE_PERIOD_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'כל התקופות' },
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
