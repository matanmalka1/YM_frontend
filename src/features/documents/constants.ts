import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { makeVariantGetter } from '@/utils/labels'
import { DOCUMENT_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
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

const STATUS_BADGE_VARIANT: Record<string, BadgeVariant> = {
  pending: 'neutral',
  received: 'info',
  approved: 'success',
  rejected: 'error',
}
export const getDocumentStatusVariant = makeVariantGetter(STATUS_BADGE_VARIANT)

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

const CURRENT_YEAR = new Date().getFullYear()
const TAX_YEARS = Array.from({ length: DOCUMENT_TAX_YEAR_RANGE }, (_, i) => CURRENT_YEAR - i)

const ALL_DOCUMENT_TYPES_OPTION = { value: '', label: 'כל הסוגים' }
const ALL_TAX_YEARS_OPTION = { value: '', label: 'כל השנים' }

export const UPLOAD_FORM_ID = 'documents-upload-form'
export const SEARCH_PLACEHOLDER = DOCUMENT_SEARCH_PLACEHOLDER
export const DOWNLOAD_ERROR_MESSAGE = 'שגיאה בהורדת המסמך'
export const PREVIEW_ERROR_MESSAGE = 'שגיאה בטעינת המסמך'
const DOCUMENT_TYPE_PLACEHOLDER = 'בחר סוג מסמך'
const WITHOUT_TAX_YEAR_LABEL = 'ללא שנה'
export const GENERAL_CLIENT_DOCUMENT_LABEL = 'מסמך כללי ללקוח'

export const DOCUMENT_TYPE_OPTIONS = [
  ALL_DOCUMENT_TYPES_OPTION,
  ...Object.entries(DOC_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

export const TAX_YEAR_OPTIONS = [
  ALL_TAX_YEARS_OPTION,
  ...TAX_YEARS.map((year) => ({
    value: String(year),
    label: String(year),
  })),
]

export const UPLOAD_DOCUMENT_TYPE_OPTIONS = [
  { value: '', label: DOCUMENT_TYPE_PLACEHOLDER, disabled: true },
  ...Object.entries(DOC_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

export const UPLOAD_TAX_YEAR_OPTIONS = [
  { value: '', label: WITHOUT_TAX_YEAR_LABEL },
  ...TAX_YEARS.map((year) => ({ value: String(year), label: String(year) })),
]
