export const parseAnnualReportCalendarDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return new Date(dateStr)
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export const TAX_YEAR_LIMITS = { min: 2015, max: 2099 }

export const CLIENT_TYPE_OPTIONS = [
  { value: 'individual', label: 'יחיד (טופס 1301)' },
  { value: 'self_employed', label: 'עצמאי (טופס 1301)' },
  { value: 'corporation', label: 'חברה (טופס 1214)' },
  { value: 'public_institution', label: 'מלכ"ר / מוסד ציבורי (טופס 1215)' },
  { value: 'partnership', label: 'שותף בשותפות (טופס 1301)' },
  { value: 'control_holder', label: 'בעל שליטה (טופס 1301)' },
  { value: 'exempt_dealer', label: 'עוסק פטור (טופס 1301)' },
]

export const DEADLINE_TYPE_OPTIONS = [
  { value: 'standard', label: 'סטנדרטי (29.05 ידני / 30.06 מקוון / 31.07 חברה)' },
  { value: 'extended', label: 'מורחב מייצגים — 31 ינואר' },
  { value: 'custom', label: 'מותאם אישית' },
]

/** Short table-cell labels for a report deadline type (distinct from the long form-select copy above). */
export const DEADLINE_TYPE_LABELS: Record<string, string> = {
  standard: 'רגיל',
  extended: 'מוארך',
  custom: 'מותאם אישית',
}
export const UNKNOWN_DEADLINE_TYPE_LABEL = 'סוג מועד לא ידוע'
export const getDeadlineTypeLabel = (type: string | null | undefined): string =>
  (type && DEADLINE_TYPE_LABELS[type]) || UNKNOWN_DEADLINE_TYPE_LABEL

export const EXTENSION_REASON_OPTIONS = [
  { value: '', label: '— ללא הארכה —' },
  { value: 'military_service', label: 'מילואים' },
  { value: 'health_reason', label: 'סיבה רפואית' },
  { value: 'general', label: 'הארכה כללית של המייצג' },
  { value: 'war_situation', label: 'מצב ביטחוני' },
]

export const WARNING_DEADLINE_DAYS = 14
export const OVERDUE_PREVIEW_LIMIT = 3
