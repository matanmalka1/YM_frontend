import type { ObligationStatus } from '@/constants/obligationStatus.constants'
import { OBLIGATION_STATUS_LABELS, OBLIGATION_STATUS_VALUES } from '@/constants/obligationStatus.constants'

const STAGE_COLORS: Record<ObligationStatus, string> = {
  awaiting_input: 'bg-gray-400',
  input_received: 'bg-info-400',
  in_progress: 'bg-info-500',
  awaiting_verification: 'bg-warning-400',
  submitted: 'bg-positive-600',
  canceled: 'bg-slate-400',
}

export const SEASON_PROGRESS_STAGES = OBLIGATION_STATUS_VALUES.map((key) => ({
  key,
  label: OBLIGATION_STATUS_LABELS[key],
  color: STAGE_COLORS[key],
}))
