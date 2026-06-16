import type { AdvancePaymentTimingStatus } from '../api/contracts'

interface Props {
  timingStatus: AdvancePaymentTimingStatus
  paidLate?: boolean
}

export const AdvancePaymentTimingBadge: React.FC<Props> = ({ timingStatus, paidLate }) => {
  if (paidLate) {
    return (
      <span className="inline-flex items-center rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-700 border border-warning-200">
        שולם באיחור
      </span>
    )
  }
  if (timingStatus === 'overdue') {
    return (
      <span className="inline-flex items-center rounded-full bg-error-50 px-2 py-0.5 text-xs font-medium text-error-700 border border-error-200">
        באיחור
      </span>
    )
  }
  return null
}

AdvancePaymentTimingBadge.displayName = 'AdvancePaymentTimingBadge'
