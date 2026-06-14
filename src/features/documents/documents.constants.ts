import type { UploadDocumentPayload } from './api'

export const DOCUMENT_TYPES = [
  'id_copy',
  'power_of_attorney',
  'engagement_agreement',
  'tax_form',
  'receipt',
  'invoice_doc',
  'bank_approval',
  'withholding_certificate',
  'nii_approval',
  'other',
] as const satisfies readonly UploadDocumentPayload['document_type'][]

export type DocumentType = (typeof DOCUMENT_TYPES)[number]

// Types that always belong to the person — cannot be uploaded with a business_id.
// Mirrors backend CLIENT_SCOPE_TYPES in permanent_document.py.
export const CLIENT_SCOPE_TYPES = new Set<UploadDocumentPayload['document_type']>([
  'id_copy',
  'power_of_attorney',
  'engagement_agreement',
])

export const DOC_TYPE_LABELS: Record<string, string> = {
  id_copy: 'צילום ת.ז.',
  power_of_attorney: 'ייפוי כוח',
  engagement_agreement: 'הסכם התקשרות',
  tax_form: 'טופס מס',
  receipt: 'קבלה',
  invoice_doc: 'חשבונית',
  bank_approval: 'אישור בנק',
  withholding_certificate: 'אישור ניכוי מס',
  nii_approval: 'אישור ביטוח לאומי',
  other: 'אחר',
}

export const STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין',
  received: 'התקבל',
  approved: 'אושר',
  rejected: 'נדחה',
}

export const STATUS_BADGE_VARIANT: Record<string, 'neutral' | 'info' | 'success' | 'error'> = {
  pending: 'neutral',
  received: 'info',
  approved: 'success',
  rejected: 'error',
}

export const DOCUMENT_ACCEPTED_MIME_TYPES: readonly string[] = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
]

export const DOCUMENT_FILE_ACCEPT = '.pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png'
export const DOCUMENT_MAX_SIZE_MB = 10
export const DOCUMENT_MAX_SIZE_BYTES = DOCUMENT_MAX_SIZE_MB * 1024 * 1024
export const DOCUMENT_TAX_YEAR_RANGE = 7
