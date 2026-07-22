export const TAX_YEAR_LIMITS = { min: 2015, max: 2099 }

import { CLIENT_TYPE_LABELS } from './display'

export const CLIENT_TYPE_OPTIONS = Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label: label.replace(/\((\d+)\)$/, '(טופס $1)'),
}))

export const DEADLINE_TYPE_OPTIONS = [
  { value: 'standard', label: 'סטנדרטי (29.05 ידני / 30.06 מקוון / 31.07 חברה)' },
  { value: 'extended', label: 'מורחב מייצגים — 31 ינואר' },
  { value: 'custom', label: 'מותאם אישית' },
]

/** Short table-cell labels for a report deadline type (distinct from the long form-select copy above). */
const DEADLINE_TYPE_LABELS: Record<string, string> = {
  standard: 'רגיל',
  extended: 'מוארך',
  custom: 'מותאם אישית',
}
const UNKNOWN_DEADLINE_TYPE_LABEL = 'סוג מועד לא ידוע'
export const getDeadlineTypeLabel = (type: string | null | undefined): string =>
  (type && DEADLINE_TYPE_LABELS[type]) || UNKNOWN_DEADLINE_TYPE_LABEL

export const EXTENSION_REASON_OPTIONS = [
  { value: '', label: '— ללא הארכה —' },
  { value: 'military_service', label: 'מילואים' },
  { value: 'health_reason', label: 'סיבה רפואית' },
  { value: 'general', label: 'הארכה כללית של המייצג' },
  { value: 'war_situation', label: 'מצב ביטחוני' },
]

export const OVERDUE_PREVIEW_LIMIT = 3
