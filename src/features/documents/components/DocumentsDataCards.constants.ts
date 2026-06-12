import { DOC_TYPE_LABELS, DOCUMENT_TAX_YEAR_RANGE } from '../documents.constants'

const CURRENT_YEAR = new Date().getFullYear()
const TAX_YEARS = Array.from({ length: DOCUMENT_TAX_YEAR_RANGE }, (_, i) => CURRENT_YEAR - i)

const ALL_DOCUMENT_TYPES_OPTION = { value: '', label: 'כל הסוגים' }
const ALL_TAX_YEARS_OPTION = { value: '', label: 'כל השנים' }

export const UPLOAD_FORM_ID = 'documents-upload-form'
export const SEARCH_PLACEHOLDER = 'חיפוש לפי שם קובץ או סוג מסמך'
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
