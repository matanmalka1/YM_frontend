import type { TimelineBinderStatus } from './api/contracts'
import { BINDER_STATUS_LABELS } from '../../utils/enums'

// ── Label maps ────────────────────────────────────────────────────────────────

const BINDER_STATUS_LABEL_MAP: Record<TimelineBinderStatus, string> = {
  none: 'חדש',
  in_office: BINDER_STATUS_LABELS.in_office,
  ready_for_pickup: BINDER_STATUS_LABELS.ready_for_pickup,
  returned: BINDER_STATUS_LABELS.returned,
}

const ANNUAL_REPORT_STATUS_LABEL_MAP: Record<string, string> = {
  not_started: 'טרם התחיל',
  collecting_docs: 'איסוף מסמכים',
  in_preparation: 'בהכנה',
  pending_client: 'ממתין ללקוח',
  submitted: 'הוגש',
  closed: 'נסגר',
  canceled: 'בוטל',
}

// ── Typed lookup helpers ──────────────────────────────────────────────────────

export const getTimelineStatusLabel = (status: string): string =>
  BINDER_STATUS_LABEL_MAP[status as TimelineBinderStatus] ?? 'לא ידוע'

export const getAnnualReportStatusLabel = (status: string): string => ANNUAL_REPORT_STATUS_LABEL_MAP[status] ?? status
