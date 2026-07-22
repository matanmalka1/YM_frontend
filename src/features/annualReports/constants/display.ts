import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { makeVariantGetter } from '@/utils/labels'
import type { AnnualReportFull, AnnualReportStatus, ClientTypeForReport, AnnualReportScheduleKey } from '../api/contracts'

// ── Status labels ──────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<AnnualReportStatus, string> = {
  not_started: 'טרם התחיל',
  collecting_docs: 'איסוף מסמכים',
  in_preparation: 'בהכנה',
  pending_client: 'ממתין לאישור לקוח',
  submitted: 'הוגש',
  closed: 'סגור',
  canceled: 'בוטל',
}

export const getStatusLabel = (status: string): string => (STATUS_LABELS as Record<string, string>)[status] ?? status

// ── Status badge variants ──────────────────────────────────────────────────

const statusVariants: Record<AnnualReportStatus, BadgeVariant> = {
  not_started: 'neutral',
  collecting_docs: 'info',
  in_preparation: 'info',
  pending_client: 'warning',
  submitted: 'positive',
  closed: 'neutral',
  canceled: 'neutral',
}

export const getStatusVariant = makeVariantGetter(statusVariants)

export const getAllowedTransitions = (report: Pick<AnnualReportFull, 'available_transitions'>): AnnualReportStatus[] =>
  report.available_transitions ?? []

// ── Client type labels ────────────────────────────────────────────────────

export const CLIENT_TYPE_LABELS: Record<ClientTypeForReport, string> = {
  individual: 'יחיד (1301)',
  self_employed: 'עצמאי (1301)',
  corporation: 'חברה (1214)',
  public_institution: 'מלכ"ר / מוסד ציבורי (1215)',
  partnership: 'שותף בשותפות (1301)',
  control_holder: 'בעל שליטה (1301)',
  exempt_dealer: 'עוסק פטור (1301)',
}

export const getClientTypeLabel = (type: ClientTypeForReport | string): string =>
  Object.prototype.hasOwnProperty.call(CLIENT_TYPE_LABELS, type) ? CLIENT_TYPE_LABELS[type as ClientTypeForReport] : type

// ── Schedule labels ────────────────────────────────────────────────────────

export const SCHEDULE_LABELS: Record<AnnualReportScheduleKey, string> = {
  schedule_a: 'נספח א — הכנסה מעסק',
  schedule_b: 'נספח ב — שכירות',
  schedule_gimmel: 'נספח ג — רווח הון מניירות ערך',
  schedule_dalet: 'נספח ד — הכנסות מחו"ל ומס זר',
  form_150: 'טופס 150 — החזקה בחבר בני אדם תושב חוץ',
  form_1504: 'טופס 1504 — שותף בשותפות',
  form_6111: 'טופס 6111 — קידוד דוחות כספיים',
  form_1344: 'טופס 1344 — דיווח על הפסדים',
  form_1399: 'טופס 1399 — מכירת נכס ורווח הון',
  form_1350: 'טופס 1350 — משיכות בעל מניות מהותי',
  form_1327: 'טופס 1327 — דוח לנאמן בנאמנות',
  form_1342: 'טופס 1342 — פירוט נכסים לפחת',
  form_1343: 'טופס 1343 — ניכוי נוסף בשל פחת',
  form_1348: 'טופס 1348 — טענת אי-תושבות ישראל',
  form_858: 'טופס 858 — יחידות השתתפות בשותפות נפט',
}

export const getScheduleLabel = (key: string): string => (SCHEDULE_LABELS as Record<string, string>)[key] ?? key
