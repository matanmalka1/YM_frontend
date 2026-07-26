import { makeLabelGetter } from '@/utils/labels'
import { CLIENT_SEARCH_WITH_OFFICE_NUMBER_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { getOperationalTaxYear, getOperationalYearOptions, MONTHS_COVERED_OPTIONS } from '@/constants/periodOptions.constants'
import { ALL_STATUSES_OPTION, ALL_TYPES_OPTION, ALL_YEARS_URL_OPTION } from '@/constants/filterOptions.constants'
import type { AdvancePaymentMethod, AdvancePaymentStatus, ListAdvancePaymentsOverviewParams } from './api/contracts'
import { ADVANCED_PAYMENTS_MESSAGES } from './messages'
import { createClientPickerFilter } from '@/features/clients/public'

/** Backend signals a decision point, not a failure — see useAdvancePaymentMutations. */
export const ADVANCE_PAYMENT_VAT_NOT_FILED_CODE = 'ADVANCE_PAYMENT.VAT_NOT_FILED'

const ADVANCE_PAYMENT_STATUS_VALUES = ['pending', 'paid', 'partial'] as const satisfies readonly AdvancePaymentStatus[]
const ADVANCE_PAYMENT_STATUS_VALUE_SET = new Set<string>(ADVANCE_PAYMENT_STATUS_VALUES)
export const ADVANCE_PAYMENT_STATUS_LABELS: Record<AdvancePaymentStatus, string> = {
  pending: 'ממתין',
  paid: 'שולם',
  partial: 'חלקי',
}
export const getAdvancePaymentStatusLabel = makeLabelGetter(ADVANCE_PAYMENT_STATUS_LABELS)

export const ADVANCE_PAYMENT_STATUS_VARIANTS: Record<AdvancePaymentStatus, BadgeVariant> = {
  paid: 'positive',
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
export const ADVANCE_PAYMENT_METHOD_LABELS: Record<AdvancePaymentMethod, string> = {
  bank_transfer: 'העברה בנקאית',
  credit_card: 'כרטיס אשראי',
  check: "צ'ק",
  direct_debit: 'הוראת קבע',
  cash: 'מזומן',
  other: 'אחר',
}
const ADVANCE_PAYMENT_METHOD_VALUE_SET = new Set<string>(ADVANCE_PAYMENT_METHOD_VALUES)
export const getAdvancePaymentMethodLabel = makeLabelGetter(ADVANCE_PAYMENT_METHOD_LABELS)

export const isAdvancePaymentStatus = (value: string): value is AdvancePaymentStatus =>
  ADVANCE_PAYMENT_STATUS_VALUE_SET.has(value)

/**
 * URL-facing status filter values: the real backend status enum plus the
 * presentation-level 'overdue' pseudo-status (server-computed timing_status,
 * never a stored AdvancePaymentStatus). Kept separate from AdvancePaymentStatus
 * so that type keeps mirroring the backend enum exactly.
 */
export type AdvancePaymentStatusFilterValue = AdvancePaymentStatus | 'overdue'

const ADVANCE_PAYMENT_STATUS_FILTER_VALUE_SET = new Set<string>([...ADVANCE_PAYMENT_STATUS_VALUES, 'overdue'])

export const isAdvancePaymentStatusFilterValue = (value: string): value is AdvancePaymentStatusFilterValue =>
  ADVANCE_PAYMENT_STATUS_FILTER_VALUE_SET.has(value)

export const isAdvancePaymentMethod = (value: string): value is AdvancePaymentMethod =>
  ADVANCE_PAYMENT_METHOD_VALUE_SET.has(value)

export type AdvancePaymentOverviewSortBy = NonNullable<ListAdvancePaymentsOverviewParams['sort_by']>
export type AdvancePaymentOverviewSortOrder = NonNullable<ListAdvancePaymentsOverviewParams['order']>

const ADVANCE_PAYMENT_OVERVIEW_SORT_BY_VALUES = [
  'client_name',
  'expected_amount',
  'paid_amount',
  'delta',
] as const satisfies readonly AdvancePaymentOverviewSortBy[]

const ADVANCE_PAYMENT_OVERVIEW_SORT_BY_VALUE_SET = new Set<string>(ADVANCE_PAYMENT_OVERVIEW_SORT_BY_VALUES)
const ADVANCE_PAYMENT_OVERVIEW_SORT_ORDER_VALUE_SET = new Set(['asc', 'desc'])

export const isAdvancePaymentOverviewSortBy = (value: string): value is AdvancePaymentOverviewSortBy =>
  ADVANCE_PAYMENT_OVERVIEW_SORT_BY_VALUE_SET.has(value)

export const isAdvancePaymentOverviewSortOrder = (value: string): value is AdvancePaymentOverviewSortOrder =>
  ADVANCE_PAYMENT_OVERVIEW_SORT_ORDER_VALUE_SET.has(value)

export const DEFAULT_ADVANCE_PAYMENT_OVERVIEW_SORT_BY: AdvancePaymentOverviewSortBy = 'client_name'
export const DEFAULT_ADVANCE_PAYMENT_OVERVIEW_SORT_ORDER: AdvancePaymentOverviewSortOrder = 'asc'

const ADVANCE_PAYMENT_OVERVIEW_SORT_BY_LABELS: Record<AdvancePaymentOverviewSortBy, string> = {
  client_name: ADVANCED_PAYMENTS_MESSAGES.overviewSort.clientNameLabel,
  expected_amount: ADVANCED_PAYMENTS_MESSAGES.overviewSort.expectedAmountLabel,
  paid_amount: ADVANCED_PAYMENTS_MESSAGES.overviewSort.paidAmountLabel,
  delta: ADVANCED_PAYMENTS_MESSAGES.overviewSort.deltaLabel,
}

const ADVANCE_PAYMENT_OVERVIEW_SORT_BY_OPTIONS: { value: AdvancePaymentOverviewSortBy; label: string }[] =
  ADVANCE_PAYMENT_OVERVIEW_SORT_BY_VALUES.map((value) => ({
    value,
    label: ADVANCE_PAYMENT_OVERVIEW_SORT_BY_LABELS[value],
  }))

/** Generic asc/desc wording (mirrors the clients-page SORT_ORDER_LABELS fallback) — the
 * order field is a static FilterFieldDef, so its options can't vary with the selected sort_by. */
const ADVANCE_PAYMENT_OVERVIEW_SORT_ORDER_OPTIONS: { value: AdvancePaymentOverviewSortOrder; label: string }[] = [
  { value: 'asc', label: ADVANCED_PAYMENTS_MESSAGES.overviewSort.orderAsc },
  { value: 'desc', label: ADVANCED_PAYMENTS_MESSAGES.overviewSort.orderDesc },
]

export const ADVANCE_PAYMENT_STATUS_OPTIONS: { value: AdvancePaymentStatus; label: string }[] = ADVANCE_PAYMENT_STATUS_VALUES.map(
  (status) => ({
    value: status,
    label: ADVANCE_PAYMENT_STATUS_LABELS[status],
  }),
)

const ADVANCE_PAYMENT_STATUS_OPTIONS_WITH_ALL: {
  value: AdvancePaymentStatusFilterValue | ''
  label: string
}[] = [
  ALL_STATUSES_OPTION,
  ...ADVANCE_PAYMENT_STATUS_OPTIONS,
  // Presentation-level pseudo-status: server-computed timing_status, not a real status.
  { value: 'overdue', label: ADVANCED_PAYMENTS_MESSAGES.stats.overdueTitle },
]

export const ADVANCE_PAYMENT_METHOD_OPTIONS: { value: AdvancePaymentMethod; label: string }[] = ADVANCE_PAYMENT_METHOD_VALUES.map(
  (method) => ({
    value: method,
    label: ADVANCE_PAYMENT_METHOD_LABELS[method],
  }),
)

export const ADVANCE_PAYMENT_FREQUENCY_OPTIONS = MONTHS_COVERED_OPTIONS

export const ADVANCE_PAYMENT_FREQUENCY_PREFIX = ADVANCED_PAYMENTS_MESSAGES.frequency.prefix
export const ADVANCE_PAYMENT_FREQUENCY_UNSET_TEXT = ADVANCED_PAYMENTS_MESSAGES.frequency.unset

/** URL value of the VAT-mismatch toggle when it is on; absent/'' means no filter. */
export const VAT_MISMATCH_FILTER_ON = 'true'

const PERIOD_OPTIONS = [ALL_TYPES_OPTION, ...MONTHS_COVERED_OPTIONS]
const YEAR_OPTIONS = [ALL_YEARS_URL_OPTION, ...getOperationalYearOptions()]

export const ADVANCE_PAYMENTS_FILTER_FIELDS = [
  // One input, two modes: typing filters free-text (client_search); picking a
  // suggestion locks the exact client (client_record_id). See ClientPickerFilter.
  createClientPickerFilter({
    idKey: 'client_record_id',
    nameKey: 'client_name',
    searchKey: 'client_search',
    label: 'לקוח',
    placeholder: CLIENT_SEARCH_WITH_OFFICE_NUMBER_PLACEHOLDER,
  }),
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
  // Orthogonal to status — a paid period can disagree with its VAT return — so
  // it is its own control rather than another option in the status select.
  {
    type: 'toggle' as const,
    key: 'vat_mismatch',
    label: ADVANCED_PAYMENTS_MESSAGES.vatMismatchFilter.label,
    options: [{ value: VAT_MISMATCH_FILTER_ON, label: ADVANCED_PAYMENTS_MESSAGES.vatMismatchFilter.mismatchOnlyOption }],
  },
  {
    type: 'select' as const,
    key: 'sort_by',
    label: ADVANCED_PAYMENTS_MESSAGES.overviewSort.sortByLabel,
    options: ADVANCE_PAYMENT_OVERVIEW_SORT_BY_OPTIONS,
    defaultValue: DEFAULT_ADVANCE_PAYMENT_OVERVIEW_SORT_BY,
  },
  {
    type: 'select' as const,
    key: 'order',
    label: ADVANCED_PAYMENTS_MESSAGES.overviewSort.orderLabel,
    options: ADVANCE_PAYMENT_OVERVIEW_SORT_ORDER_OPTIONS,
    defaultValue: DEFAULT_ADVANCE_PAYMENT_OVERVIEW_SORT_ORDER,
  },
]
