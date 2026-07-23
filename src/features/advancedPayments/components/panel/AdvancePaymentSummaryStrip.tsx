import { BarChart2, Coins, TrendingUp, Wallet } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { Badge } from '@/components/ui/primitives/Badge'
import { ProgressBar } from '@/components/ui/primitives/ProgressBar'
import { formatShekelAmount } from '@/utils/utils'
import type { AdvancePaymentRow } from '../../api/contracts'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentSummaryStripProps {
  payment: AdvancePaymentRow
}

export const AdvancePaymentSummaryStrip: React.FC<AdvancePaymentSummaryStripProps> = ({ payment }) => {
  const expected = Number(payment.expected_amount ?? 0)
  const paid = Number(payment.paid_amount ?? 0)
  const balance = Math.max(expected - paid, 0)
  // With nothing due (expected = 0, e.g. missing turnover) there is no collection
  // verdict to give — "paid in full" and a 100% bar would misread as settled.
  const hasAmountDue = expected > 0
  const collectionPercent = hasAmountDue ? Math.min(Math.round((paid / expected) * 100), 100) : 0

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        title={ADVANCED_PAYMENTS_MESSAGES.detail.expectedStatTitle}
        value={formatShekelAmount(payment.expected_amount)}
        icon={BarChart2}
        variant="info"
      />
      <StatsCard
        title={ADVANCED_PAYMENTS_MESSAGES.detail.paidStatTitle}
        value={formatShekelAmount(payment.paid_amount)}
        icon={Wallet}
        variant="positive"
        footer={
          hasAmountDue ? (
            <div className="flex items-center gap-2">
              <ProgressBar value={collectionPercent} size="sm" tone="positive" className="flex-1" />
              <span className="text-xs font-medium text-positive-600 tabular-nums">{collectionPercent}%</span>
            </div>
          ) : undefined
        }
      />
      <StatsCard
        title={ADVANCED_PAYMENTS_MESSAGES.detail.balanceStatTitle}
        value={formatShekelAmount(String(balance))}
        icon={Coins}
        variant={balance > 0 ? 'negative' : 'neutral'}
        footer={
          balance > 0 ? (
            <Badge variant="warning" size="xs">
              {ADVANCED_PAYMENTS_MESSAGES.detail.balanceDueBadge}
            </Badge>
          ) : hasAmountDue ? (
            <Badge variant="positive" size="xs">
              {ADVANCED_PAYMENTS_MESSAGES.detail.paidInFullBadge}
            </Badge>
          ) : undefined
        }
      />
      {/* Only the stored turnover. An available-but-unsnapshotted VAT figure is
          surfaced as an action in the calculation card, never as a stat value. */}
      <StatsCard
        title={ADVANCED_PAYMENTS_MESSAGES.detail.turnoverStatTitle}
        value={payment.turnover_amount != null ? formatShekelAmount(payment.turnover_amount) : '—'}
        icon={TrendingUp}
        variant={payment.turnover_amount == null ? 'warning' : 'purple'}
        footer={
          payment.turnover_source != null ? (
            <Badge variant="purple" size="xs">
              {ADVANCED_PAYMENTS_MESSAGES.detail.turnoverSourceBadge(payment.turnover_source)}
            </Badge>
          ) : payment.available_turnover != null ? (
            <Badge variant="info" size="xs">
              {ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.availableBadge}
            </Badge>
          ) : (
            <Badge variant="warning" size="xs">
              {ADVANCED_PAYMENTS_MESSAGES.detail.turnoverMissingBadge}
            </Badge>
          )
        }
      />
    </div>
  )
}

AdvancePaymentSummaryStrip.displayName = 'AdvancePaymentSummaryStrip'
