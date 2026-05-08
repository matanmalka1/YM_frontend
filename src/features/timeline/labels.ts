import type { TimelineBinderStatus } from './api/contracts'
import { BINDER_STATUS_LABELS } from '../../utils/enums'

// ── Label maps ────────────────────────────────────────────────────────────────

const BINDER_STATUS_LABEL_MAP: Record<TimelineBinderStatus, string> = {
  none: 'חדש',
  in_office: BINDER_STATUS_LABELS.in_office,
  ready_for_pickup: BINDER_STATUS_LABELS.ready_for_pickup,
  returned: BINDER_STATUS_LABELS.returned,
}

// ── Typed lookup helpers ──────────────────────────────────────────────────────

export const getTimelineStatusLabel = (status: string): string =>
  BINDER_STATUS_LABEL_MAP[status as TimelineBinderStatus] ?? 'לא ידוע'
