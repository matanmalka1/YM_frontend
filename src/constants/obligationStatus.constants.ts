import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import type { components } from '@/types/generated'

/**
 * The lifecycle every tax obligation runs — VAT, advance payments, annual reports.
 *
 * They ran the same sequence under three different names, so each feature carried
 * its own label map, its own badge variants and its own ordering. One lifecycle
 * gets one vocabulary; the features render it rather than restating it.
 */
export type ObligationStatus = components['schemas']['ObligationStatus']

/** The ladder, in order. `canceled` is off-ladder and deliberately absent. */
const OBLIGATION_STAGES = [
  'awaiting_input',
  'input_received',
  'in_progress',
  'awaiting_verification',
  'submitted',
] as const satisfies readonly ObligationStatus[]

/** @auditContract Read by the backend enum-sync audit. */
export const OBLIGATION_STATUS_VALUES = [...OBLIGATION_STAGES, 'canceled'] as const satisfies readonly ObligationStatus[]

export const OBLIGATION_STATUS_LABELS: Record<ObligationStatus, string> = {
  awaiting_input: 'ממתין לחומר',
  input_received: 'החומר התקבל',
  in_progress: 'בעבודה',
  awaiting_verification: 'ממתין לאימות',
  submitted: 'הוגש',
  canceled: 'בוטל',
}

export const OBLIGATION_STATUS_VARIANTS: Record<ObligationStatus, BadgeVariant> = {
  awaiting_input: 'neutral',
  input_received: 'info',
  in_progress: 'info',
  awaiting_verification: 'warning',
  submitted: 'positive',
  canceled: 'neutral',
}

export const getObligationStatusLabel = (status: string): string =>
  (OBLIGATION_STATUS_LABELS as Record<string, string>)[status] ?? status

/** No further work: submitted or cancelled. Mirrors the backend's resolved set. */
export const isObligationResolved = (status: ObligationStatus): boolean => status === 'submitted' || status === 'canceled'

/** D-13: nothing on a submitted record changes — every change is an amendment.
 * Mirrors the backend's `is_locked`; edit surfaces hide/disable on it. */
export const isObligationLocked = (status: ObligationStatus): boolean => status === 'submitted'

/** The single stage forward on the ladder, or null at the end / off-ladder. */
export const nextObligationStage = (status: ObligationStatus): ObligationStatus | null => {
  const index = (OBLIGATION_STAGES as readonly string[]).indexOf(status)
  return index >= 0 && index + 1 < OBLIGATION_STAGES.length ? OBLIGATION_STAGES[index + 1] : null
}

/** The single stage back on the ladder, or null at the start / off-ladder. */
export const previousObligationStage = (status: ObligationStatus): ObligationStatus | null => {
  const index = (OBLIGATION_STAGES as readonly string[]).indexOf(status)
  return index > 0 ? OBLIGATION_STAGES[index - 1] : null
}
