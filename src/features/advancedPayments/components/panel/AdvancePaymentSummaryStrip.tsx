import { BarChart2, Coins, TrendingUp, Wallet } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'
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
      />
      <StatsCard
        title={ADVANCED_PAYMENTS_MESSAGES.detail.balanceStatTitle}
        value={formatShekelAmount(String(balance))}
        icon={Coins}
        variant={balance > 0 ? 'negative' : 'neutral'}
      />
      {/* Only the stored turnover. An available-but-unsnapshotted VAT figure is
          surfaced as an action in the calculation card, never as a stat value. */}
      <StatsCard
        title={ADVANCED_PAYMENTS_MESSAGES.detail.turnoverStatTitle}
        value={payment.turnover_amount != null ? formatShekelAmount(payment.turnover_amount) : '—'}
        icon={TrendingUp}
        variant={payment.turnover_amount == null ? 'warning' : 'purple'}
      />
    </div>
  )
}

AdvancePaymentSummaryStrip.displayName = 'AdvancePaymentSummaryStrip'
