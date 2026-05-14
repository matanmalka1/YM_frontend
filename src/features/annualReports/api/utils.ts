import { makeClassGetter, makeLabelGetter } from '@/utils/labels'
import type { AnnualReportFull, AnnualReportStatus, ClientTypeForReport, AnnualReportScheduleKey } from './contracts'

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

type BadgeVariant = 'neutral' | 'info' | 'warning' | 'success' | 'error'

const statusVariants: Record<AnnualReportStatus, BadgeVariant> = {
  not_started: 'neutral',
  collecting_docs: 'info',
  in_preparation: 'info',
  pending_client: 'warning',
  submitted: 'success',
  closed: 'neutral',
  canceled: 'neutral',
}

export const getStatusVariant = (status: string): BadgeVariant =>
  (statusVariants as Record<string, BadgeVariant>)[status] ?? 'neutral'

export const getAllowedTransitions = (report: Pick<AnnualReportFull, 'available_transitions'>): AnnualReportStatus[] =>
  report.available_transitions ?? []

// ── Client type labels ────────────────────────────────────────────────────

const clientTypeLabels: Record<ClientTypeForReport, string> = {
  individual: 'יחיד (1301)',
  self_employed: 'עצמאי (1301)',
  corporation: 'חברה (1214)',
  public_institution: 'מלכ"ר / מוסד ציבורי (1215)',
  partnership: 'שותף בשותפות (1301)',
  control_holder: 'בעל שליטה (1301)',
  exempt_dealer: 'עוסק פטור (1301)',
}

export const getClientTypeLabel = (type: string): string => (clientTypeLabels as Record<string, string>)[type] ?? type

// ── Schedule labels ────────────────────────────────────────────────────────

const scheduleLabels: Record<AnnualReportScheduleKey, string> = {
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

export const getScheduleLabel = (key: string): string => (scheduleLabels as Record<string, string>)[key] ?? key

// ── Season progress helpers ────────────────────────────────────────────────

export const SEASON_PROGRESS_STAGES = [
  { key: 'not_started' as AnnualReportStatus, label: 'טרם התחיל', color: 'bg-gray-400' },
  { key: 'collecting_docs' as AnnualReportStatus, label: 'איסוף מסמכים', color: 'bg-info-400' },
  { key: 'in_preparation' as AnnualReportStatus, label: 'בהכנה', color: 'bg-info-500' },
  { key: 'pending_client' as AnnualReportStatus, label: 'ממתין ללקוח', color: 'bg-warning-400' },
  { key: 'submitted' as AnnualReportStatus, label: 'הוגש', color: 'bg-positive-400' },
  { key: 'closed' as AnnualReportStatus, label: 'סגור', color: 'bg-positive-700' },
]

// ── Stage labels (from annualReport.utils.ts) ─────────────────────────────

const stageLabels = {
  material_collection: 'איסוף חומרים',
  in_progress: 'בטיפול',
  final_review: 'סקירה סופית',
  client_signature: 'חתימת לקוח',
  transmitted: 'הועבר',
  post_submission: 'לאחר הגשה',
}

const stageColors = {
  material_collection: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-info-100 text-info-700',
  final_review: 'bg-info-100 text-info-700',
  client_signature: 'bg-warning-100 text-warning-700',
  transmitted: 'bg-positive-100 text-positive-700',
  post_submission: 'bg-warning-100 text-warning-800',
}

export const getReportStageLabel = makeLabelGetter(stageLabels)
export const getStageColor = makeClassGetter(stageColors, 'material_collection')
