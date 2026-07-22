import type { AnnualReportStatus } from '../../api'
import { STATUS_LABELS } from '../../constants/display'

const STAGE_COLORS: Record<AnnualReportStatus, string> = {
  not_started: 'bg-gray-400',
  collecting_docs: 'bg-info-400',
  in_preparation: 'bg-info-500',
  pending_client: 'bg-warning-400',
  submitted: 'bg-positive-400',
  closed: 'bg-positive-700',
  canceled: 'bg-slate-400',
}

export const SEASON_PROGRESS_STAGES = (Object.keys(STATUS_LABELS) as AnnualReportStatus[]).map((key) => ({
  key,
  label: STATUS_LABELS[key],
  color: STAGE_COLORS[key],
}))
