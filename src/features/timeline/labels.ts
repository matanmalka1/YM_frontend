import type { TimelineBinderStatus } from './api/contracts'
import { BINDER_CAPACITY_STATUS_LABELS, BINDER_LOCATION_STATUS_LABELS } from '@/features/binders'

const BINDER_LIFECYCLE_LABEL_MAP: Record<TimelineBinderStatus, string> = {
  null: 'חדש',
  in_office: BINDER_LOCATION_STATUS_LABELS.in_office,
  ready_for_handover: BINDER_LOCATION_STATUS_LABELS.ready_for_handover,
  handed_over: BINDER_LOCATION_STATUS_LABELS.handed_over,
  open: BINDER_CAPACITY_STATUS_LABELS.open,
  full: BINDER_CAPACITY_STATUS_LABELS.full,
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

export const getTimelineStatusLabel = (status: string): string =>
  BINDER_LIFECYCLE_LABEL_MAP[status as TimelineBinderStatus] ?? 'לא ידוע'

export const getAnnualReportStatusLabel = (status: string): string => ANNUAL_REPORT_STATUS_LABEL_MAP[status] ?? status
