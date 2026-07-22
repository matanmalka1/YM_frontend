import { makeLabelGetter, makeVariantGetter } from '@/utils/labels'
import { formatCount } from '@/utils/utils'
import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { CATEGORY_COLOR_TOKENS } from './visualizationTokens'
import { ALL_STATUSES_OPTION } from '@/constants/filterOptions.constants'
import type { VatWorkItemStatus } from '../api'
import { VAT_REPORTING_FREQUENCY_LABELS } from '@/types/vatReporting'

/** @auditContract Read by the backend enum-sync audit. */
export const VAT_WORK_ITEM_STATUS_VALUES = [
  'pending_materials',
  'material_received',
  'data_entry_in_progress',
  'ready_for_review',
  'filed',
  'canceled',
] as const satisfies readonly VatWorkItemStatus[]

export type VatRateTypeValue = 'standard' | 'exempt' | 'zero_rate'
export const VAT_RATE_TYPE_LABELS: Record<VatRateTypeValue, string> = {
  standard: 'רגיל',
  exempt: 'פטור',
  zero_rate: 'אפס',
}

export type VatDocumentTypeValue =
  | 'tax_invoice'
  | 'transaction_invoice'
  | 'receipt'
  | 'consolidated'
  | 'self_invoice'
  | 'credit_note'
export const DOCUMENT_TYPE_LABELS: Record<VatDocumentTypeValue, string> = {
  tax_invoice: 'חשבונית מס',
  transaction_invoice: 'חשבונית עסקה',
  receipt: 'קבלה',
  consolidated: 'חשבונית מרוכזת',
  self_invoice: 'חשבונית עצמית',
  credit_note: 'הודעת זיכוי',
}

const VAT_WORK_ITEM_STATUS_LABELS: Record<VatWorkItemStatus, string> = {
  pending_materials: 'ממתין לחומרים',
  material_received: 'חומרים התקבלו',
  data_entry_in_progress: 'הקלדה בתהליך',
  ready_for_review: 'ממתין לבדיקה',
  filed: 'הוגש',
  canceled: 'בוטל',
}
export const getVatWorkItemStatusLabel = makeLabelGetter(VAT_WORK_ITEM_STATUS_LABELS)

export const VAT_PERIOD_TYPE_OPTIONS = [
  { value: '', label: 'כל סוגי הדיווח' },
  { value: 'monthly', label: VAT_REPORTING_FREQUENCY_LABELS.monthly },
  { value: 'bimonthly', label: VAT_REPORTING_FREQUENCY_LABELS.bimonthly },
] as const

export const VAT_PERIOD_TYPE_SELECT_OPTIONS = [...VAT_PERIOD_TYPE_OPTIONS]

export const VAT_PERIOD_TYPES = ['monthly', 'bimonthly'] as const
export type VatPeriodTypeFilter = (typeof VAT_PERIOD_TYPES)[number]

export const CATEGORY_COLORS: Record<string, string> = CATEGORY_COLOR_TOKENS

export const VAT_STATUS_BADGE_VARIANTS: Record<VatWorkItemStatus, BadgeVariant> = {
  pending_materials: 'warning',
  material_received: 'info',
  data_entry_in_progress: 'info',
  ready_for_review: 'warning',
  filed: 'positive',
  canceled: 'neutral',
}
export const getVatWorkItemStatusVariant = makeVariantGetter(VAT_STATUS_BADGE_VARIANTS)

const VAT_CLIENT_SUMMARY_STATUS_VARIANTS: Record<VatWorkItemStatus, BadgeVariant> = {
  filed: 'positive',
  canceled: 'neutral',
  ready_for_review: 'warning',
  data_entry_in_progress: 'info',
  material_received: 'info',
  pending_materials: 'warning',
}
export const getVatClientSummaryStatusVariant = makeVariantGetter(VAT_CLIENT_SUMMARY_STATUS_VARIANTS)

export const VAT_WORKFLOW_STEPS = [
  'pending_materials',
  'material_received',
  'data_entry_in_progress',
  'ready_for_review',
  'filed',
] as const satisfies readonly VatWorkItemStatus[]

export const VAT_WORK_ITEMS_STATS_STATUS_GROUPS = {
  pending: ['pending_materials'],
  typing: ['material_received', 'data_entry_in_progress'],
  review: ['ready_for_review'],
  filed: ['filed'],
} as const

export const VAT_WORK_ITEMS_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  ALL_STATUSES_OPTION,
  ...VAT_WORKFLOW_STEPS.map((status) => ({
    value: status,
    label: getVatWorkItemStatusLabel(status),
  })),
]

export const VAT_FILING_METHOD_LABELS: Record<string, string> = {
  manual: 'ידנית',
  online: 'אונליין',
  representative: 'דרך מערכת המייצגים',
}

export const VAT_FILING_METHODS = ['online', 'manual', 'representative'] as const
export const DEFAULT_VAT_FILING_METHOD = VAT_FILING_METHODS[0]

export const DEFAULT_RATE_TYPE = 'standard' as const

// Mirrors app/vat_reports/services/constants.py: EXCEPTIONAL_INVOICE_THRESHOLD
const VAT_EXCEPTIONAL_INVOICE_THRESHOLD = 25_000
export const VAT_EXCEPTIONAL_INVOICE_TOOLTIP = `חשבונית מעל ${formatCount(VAT_EXCEPTIONAL_INVOICE_THRESHOLD)} ₪ — נדרש דיווח מיוחד`

// Any field backed by a backend enum MUST use a Zod enum in the frontend schema.
export const VAT_RATE_TYPES = ['standard', 'exempt', 'zero_rate'] as const
export const VAT_RATE_TYPE_OPTIONS = VAT_RATE_TYPES.map((rateType) => ({
  value: rateType,
  label: VAT_RATE_TYPE_LABELS[rateType],
}))

export const DOCUMENT_TYPES = [
  'tax_invoice',
  'transaction_invoice',
  'receipt',
  'consolidated',
  'self_invoice',
  'credit_note',
] as const

export const DOCUMENT_TYPE_OPTIONS = DOCUMENT_TYPES.map((documentType) => ({
  value: documentType,
  label: DOCUMENT_TYPE_LABELS[documentType],
}))

export const COUNTERPARTY_ID_TYPES = ['il_business', 'il_personal', 'foreign', 'anonymous'] as const
export type CounterpartyIdType = (typeof COUNTERPARTY_ID_TYPES)[number]

export const INVOICE_TYPES = ['income', 'expense'] as const

export const VAT_DEADLINE_WARNING_DAYS = 3

export const VAT_NUMERIC_KEYS = ['ArrowLeft', 'ArrowRight', 'Delete', 'Backspace', 'Enter', 'Tab']
