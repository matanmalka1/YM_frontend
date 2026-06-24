import { makeLabelGetter, makeVariantGetter } from '@/utils/labels'
import { formatCount } from '@/utils/utils'
import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { CATEGORY_COLOR_TOKENS } from './visualizationTokens'
import { ALL_STATUSES_OPTION, ALL_CATEGORIES_OPTION } from '@/constants/filterOptions.constants'
import type { VatWorkItemStatus } from '../api'

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

const INCOME_KEY = 'income'

export const VAT_PERIOD_TYPE_OPTIONS = [
  { value: '', label: 'כל סוגי הדיווח' },
  { value: 'monthly', label: 'חודשי' },
  { value: 'bimonthly', label: 'דו־חודשי' },
] as const

export const VAT_PERIOD_TYPE_SELECT_OPTIONS = [...VAT_PERIOD_TYPE_OPTIONS]

export const VAT_PERIOD_TYPES = ['monthly', 'bimonthly'] as const
export type VatPeriodTypeFilter = (typeof VAT_PERIOD_TYPES)[number]

export const EXPENSE_CATEGORIES = [
  'inventory',
  'office',
  'travel',
  'professional_services',
  'equipment',
  'rent',
  'salary',
  'marketing',
  'vehicle',
  'fuel',
  'vehicle_maintenance',
  'vehicle_insurance',
  'vehicle_leasing',
  'tolls_and_parking',
  'entertainment',
  'gifts',
  'communication',
  'insurance',
  'maintenance',
  'municipal_tax',
  'utilities',
  'postage_and_shipping',
  'bank_fees',
  'mixed_expense',
] as const

export const CATEGORY_LABELS: Record<string, string> = {
  [INCOME_KEY]: 'הכנסות',
  inventory: 'קניית סחורה / מלאי',
  office: 'משרד',
  travel: 'נסיעות',
  professional_services: 'שירותים מקצועיים',
  equipment: 'ציוד',
  rent: 'שכירות',
  salary: 'שכר עבודה',
  marketing: 'שיווק',
  vehicle: 'רכב פרטי',
  fuel: 'דלק',
  vehicle_maintenance: 'תחזוקת רכב',
  vehicle_insurance: 'ביטוח רכב',
  vehicle_leasing: 'ליסינג רכב',
  tolls_and_parking: 'חניה וכבישי אגרה',
  entertainment: 'אירוח וכיבוד',
  gifts: 'מתנות',
  communication: 'תקשורת',
  insurance: 'ביטוח',
  maintenance: 'תחזוקה',
  municipal_tax: 'ארנונה',
  utilities: 'חשמל ומים',
  postage_and_shipping: 'משלוחים ודואר',
  bank_fees: 'עמלות בנק',
  mixed_expense: 'הוצאה מעורבת',
}

export const CATEGORY_COLORS: Record<string, string> = CATEGORY_COLOR_TOKENS

/** VAT deduction rates per expense category (frontend display only) */
export const DEDUCTION_RATES: Record<string, number> = {
  inventory: 1.0,
  office: 1.0,
  travel: 2 / 3, // רכב — 66.67%
  professional_services: 1.0,
  equipment: 1.0,
  rent: 1.0,
  salary: 0.0,
  marketing: 1.0,
  vehicle: 2 / 3,
  fuel: 2 / 3,
  vehicle_maintenance: 2 / 3,
  vehicle_insurance: 0.0,
  vehicle_leasing: 2 / 3,
  tolls_and_parking: 2 / 3,
  entertainment: 0.0,
  gifts: 0.0,
  communication: 2 / 3,
  insurance: 0.0,
  maintenance: 1.0,
  municipal_tax: 0.0,
  utilities: 1.0,
  postage_and_shipping: 1.0,
  bank_fees: 1.0,
  mixed_expense: 2 / 3,
}

/** Like CATEGORY_LABELS but travel → "נסיעות/רכב" for the breakdown table */
export const CATEGORY_TABLE_LABELS: Record<string, string> = {
  ...CATEGORY_LABELS,
  travel: 'רכב',
}

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

export const VAT_EXPENSE_CATEGORY_FILTER_OPTIONS = [
  ALL_CATEGORIES_OPTION,
  ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] ?? c })),
]

export const VAT_EXPENSE_CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((category) => ({
  value: category,
  label: CATEGORY_LABELS[category],
}))

export const VAT_FILING_METHOD_LABELS: Record<string, string> = {
  manual: 'ידנית',
  online: 'אונליין',
  representative: 'דרך מערכת המייצגים',
}

export const VAT_FILING_METHODS = ['online', 'manual', 'representative'] as const
export const DEFAULT_VAT_FILING_METHOD = VAT_FILING_METHODS[0]

export const VAT_FILE_MODAL_MESSAGES = {
  invalidAmendmentId: 'מזהה ההגשה המקורית חייב להיות מספר',
  filingSuccess: 'התיק הוגש בהצלחה',
  filingError: 'שגיאה בהגשה',
} as const

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
