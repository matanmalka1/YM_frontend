import { DefinitionList } from '@/components/ui/layout/DefinitionList'
import { Card } from '@/components/ui/primitives/Card'
import { formatShekelAmount, formatDate, formatPercent } from '@/utils/utils'
import type { AdvancePaymentRow } from '../../api/contracts'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentContextCardProps {
  payment: AdvancePaymentRow
  clientIdNumber?: string | null
}

export const AdvancePaymentContextCard: React.FC<AdvancePaymentContextCardProps> = ({ payment, clientIdNumber }) => {
  const advanceRateDisplay =
    payment.advance_rate != null
      ? formatPercent(payment.advance_rate, { fractionDigits: 2, fallback: `${payment.advance_rate}%` })
      : null

  const turnoverLabel =
    payment.turnover_amount != null
      ? ADVANCED_PAYMENTS_MESSAGES.detail.manualTurnoverSuffix(formatShekelAmount(payment.turnover_amount))
      : payment.live_turnover != null
        ? ADVANCED_PAYMENTS_MESSAGES.detail.liveTurnoverSuffix(formatShekelAmount(payment.live_turnover))
        : null

  const timingStatusLabel = payment.paid_late
    ? ADVANCED_PAYMENTS_MESSAGES.detail.paidLateLabel
    : payment.timing_status === 'overdue'
      ? ADVANCED_PAYMENTS_MESSAGES.detail.overdueLabel
      : null
  const timingStatusClass = payment.paid_late ? 'text-warning-600' : 'text-negative-600'

  return (
    <Card title={ADVANCED_PAYMENTS_MESSAGES.detail.contextSectionTitle} size="compact" variant="outlined">
      <DefinitionList
        layout="stacked"
        items={[
          ...(clientIdNumber
            ? [{ label: ADVANCED_PAYMENTS_MESSAGES.detail.idNumberLabel, value: clientIdNumber }]
            : []),
          ...(advanceRateDisplay
            ? [{ label: ADVANCED_PAYMENTS_MESSAGES.detail.advanceRateLabel, value: advanceRateDisplay }]
            : []),
          {
            label: ADVANCED_PAYMENTS_MESSAGES.detail.dueDateLabel,
            value: formatDate(payment.due_date_effective ?? payment.due_date),
          },
          {
            label: ADVANCED_PAYMENTS_MESSAGES.detail.periodTurnoverLabel,
            value: turnoverLabel ?? (
              <span className="text-gray-400 text-xs">{ADVANCED_PAYMENTS_MESSAGES.detail.vatPendingNote}</span>
            ),
          },
          ...(timingStatusLabel
            ? [
                {
                  label: ADVANCED_PAYMENTS_MESSAGES.detail.timingStatusLabel,
                  value: <span className={`${timingStatusClass} text-xs font-medium`}>{timingStatusLabel}</span>,
                },
              ]
            : []),
        ]}
      />
    </Card>
  )
}

AdvancePaymentContextCard.displayName = 'AdvancePaymentContextCard'
