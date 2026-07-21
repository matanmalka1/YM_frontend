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

  // Context lists what the payment holds. An available VAT figure is not held.
  const turnoverLabel =
    payment.turnover_amount != null && payment.turnover_source != null
      ? ADVANCED_PAYMENTS_MESSAGES.detail.turnoverWithSource(formatShekelAmount(payment.turnover_amount), payment.turnover_source)
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
          ...(clientIdNumber ? [{ label: ADVANCED_PAYMENTS_MESSAGES.detail.idNumberLabel, value: clientIdNumber }] : []),
          ...(advanceRateDisplay
            ? [{ label: ADVANCED_PAYMENTS_MESSAGES.detail.advanceRateLabel, value: advanceRateDisplay }]
            : []),
          {
            label: ADVANCED_PAYMENTS_MESSAGES.detail.dueDateLabel,
            value: formatDate(payment.due_date_effective ?? payment.due_date),
          },
          {
            label: ADVANCED_PAYMENTS_MESSAGES.detail.periodTurnoverLabel,
            // The fallback states why nothing is held — a filed return waiting to
            // be snapshotted is a different situation from no return at all.
            value: turnoverLabel ?? (
              <span className="text-gray-400 text-xs">
                {payment.available_turnover != null
                  ? ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.available(
                      payment.available_turnover.source,
                      formatShekelAmount(payment.available_turnover.amount),
                    )
                  : ADVANCED_PAYMENTS_MESSAGES.detail.noVatReportNote}
              </span>
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
