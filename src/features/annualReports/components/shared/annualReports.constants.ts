export const parseAnnualReportCalendarDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return new Date(dateStr)
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export const formatAnnualReportDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—'
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return new Date(dateStr).toLocaleDateString('he-IL')
  const [, year, month, day] = match
  return `${day}/${month}/${year}`
}

export const formatAnnualReportMonthDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export const formatWholeNumber = (n: number) =>
  n.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

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

export const EXTENSION_REASON_OPTIONS = [
  { value: '', label: '— ללא הארכה —' },
  { value: 'military_service', label: 'מילואים' },
  { value: 'health_reason', label: 'סיבה רפואית' },
  { value: 'general', label: 'הארכה כללית של המייצג' },
  { value: 'war_situation', label: 'מצב ביטחוני' },
]

export const REQUIRED_DOCUMENT_TYPES = ['id_copy', 'power_of_attorney', 'engagement_agreement'] as const

export const WARNING_DEADLINE_DAYS = 14
export const OVERDUE_PREVIEW_LIMIT = 3
