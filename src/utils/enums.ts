import { makeLabelGetter } from './labels'
import { ENTITY_TYPE_LABELS, CLIENT_STATUS_LABELS, VAT_TYPE_LABELS } from '../features/clients/constants'

// ── Binder status ──────────────────────────────────────────────────────────

export const BINDER_STATUS_LABELS: Record<string, string> = {
  in_office: 'במשרד',
  closed_in_office: 'סגור במשרד',
  archived_in_office: 'ארכיון במשרד',
  ready_for_pickup: 'מוכן לאיסוף',
  returned: 'הוחזר',
}

export const getStatusLabel = makeLabelGetter(BINDER_STATUS_LABELS)

// ── Binder type ────────────────────────────────────────────────────────────

export const BINDER_TYPE_LABELS: Record<string, string> = {
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

// ── Client ─────────────────────────────────────────────────────────────────

export const getClientTypeLabel = makeLabelGetter(ENTITY_TYPE_LABELS)

export const getClientStatusLabel = makeLabelGetter(CLIENT_STATUS_LABELS)

// ── Charge ─────────────────────────────────────────────────────────────────

export const CHARGE_STATUS_LABELS: Record<string, string> = {
  draft: 'טיוטה',
  issued: 'הונפק',
  paid: 'שולם',
  canceled: 'בוטל',
}

export const getChargeStatusLabel = makeLabelGetter(CHARGE_STATUS_LABELS)

export const CHARGE_STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  draft: 'neutral',
  issued: 'info',
  paid: 'success',
  canceled: 'error',
}

export const CHARGE_TYPE_LABELS: Record<string, string> = {
  monthly_retainer: 'ריטיינר חודשי',
  annual_report_fee: 'שכר טרחה לדוח שנתי',
  vat_filing_fee: 'שכר טרחה לדוח מע״מ',
  representation_fee: 'שכר טרחה לייצוג',
  consultation_fee: 'שכר טרחה לייעוץ',
  other: 'אחר',
}

export const getChargeTypeLabel = makeLabelGetter(CHARGE_TYPE_LABELS)

// ── Advance payment ────────────────────────────────────────────────────────

export const ADVANCE_PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין',
  paid: 'שולם',
  partial: 'חלקי',
}

export const getAdvancePaymentStatusLabel = makeLabelGetter(ADVANCE_PAYMENT_STATUS_LABELS)

export const ADVANCE_PAYMENT_STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  paid: 'success',
  partial: 'warning',
  pending: 'neutral',
}

export const ADVANCE_PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'העברה בנקאית',
  credit_card: 'כרטיס אשראי',
  check: "צ'ק",
  direct_debit: 'הוראת קבע',
  cash: 'מזומן',
  other: 'אחר',
}

export const getAdvancePaymentMethodLabel = makeLabelGetter(ADVANCE_PAYMENT_METHOD_LABELS)

// ── User role ──────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
  advisor: 'יועץ',
  secretary: 'מזכירה',
}

export const getRoleLabel = makeLabelGetter(ROLE_LABELS)

// ── Signature request ──────────────────────────────────────────────────────

export const SIGNATURE_REQUEST_STATUS_LABELS: Record<string, string> = {
  draft: 'טיוטה',
  pending_signature: 'ממתין לחתימה',
  signed: 'נחתם',
  declined: 'נדחה',
  expired: 'פג תוקף',
  canceled: 'בוטל',
}

export const getSignatureRequestStatusLabel = makeLabelGetter(SIGNATURE_REQUEST_STATUS_LABELS)

export const SIGNATURE_REQUEST_TYPE_LABELS: Record<string, string> = {
  engagement_agreement: 'הסכם התקשרות',
  annual_report_approval: 'אישור דוח שנתי',
  power_of_attorney: 'ייפוי כוח',
  vat_return_approval: 'אישור דוח מע"מ',
  custom: 'מותאם אישית',
}

export const getSignatureRequestTypeLabel = makeLabelGetter(SIGNATURE_REQUEST_TYPE_LABELS)

export const SIGNATURE_REQUEST_STATUS_VARIANTS: Record<string, 'neutral' | 'info' | 'warning' | 'success' | 'error'> = {
  draft: 'neutral',
  pending_signature: 'info',
  signed: 'success',
  declined: 'error',
  expired: 'warning',
  canceled: 'neutral',
}

// ── VAT ────────────────────────────────────────────────────────────────────

export const VAT_RATE_TYPE_LABELS: Record<string, string> = {
  standard: 'רגיל',
  exempt: 'פטור',
  zero_rate: 'אפס',
}

export const getVatRateTypeLabel = makeLabelGetter(VAT_RATE_TYPE_LABELS)

export const getVatTypeLabel = makeLabelGetter(VAT_TYPE_LABELS)

export const VAT_WORK_ITEM_STATUS_LABELS: Record<string, string> = {
  pending_materials: 'ממתין לחומרים',
  material_received: 'חומרים התקבלו',
  data_entry_in_progress: 'הקלדה בתהליך',
  ready_for_review: 'ממתין לבדיקה',
  filed: 'הוגש',
}

export const getVatWorkItemStatusLabel = makeLabelGetter(VAT_WORK_ITEM_STATUS_LABELS)

// ── Document ───────────────────────────────────────────────────────────────

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  tax_invoice: 'חשבונית מס',
  transaction_invoice: 'חשבונית עסקה',
  receipt: 'קבלה',
  consolidated: 'חשבונית מרוכזת',
  self_invoice: 'חשבונית עצמית',
  credit_note: 'הודעת זיכוי',
}

export const getDocumentTypeLabel = makeLabelGetter(DOCUMENT_TYPE_LABELS)
