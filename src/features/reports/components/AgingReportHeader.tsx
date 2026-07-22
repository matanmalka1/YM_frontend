import { Clock, DollarSign } from 'lucide-react'
import { StatsCard } from '../../../components/ui/layout/StatsCard'
import type { AgingReportResponse } from '../api'
import { formatILS, toReportNumber, type ReportMoneyValue } from '../utils'
import { REPORTS_MESSAGES } from '../messages'

interface AgingReportHeaderProps {
  data: AgingReportResponse
}

const getBucketShare = (amount: ReportMoneyValue, total: ReportMoneyValue) => {
  const numericAmount = toReportNumber(amount)
  const numericTotal = toReportNumber(total)
  return numericTotal > 0
    ? REPORTS_MESSAGES.aging.shareOfDebt(Math.round((numericAmount / numericTotal) * 100))
    : REPORTS_MESSAGES.aging.zeroShareOfDebt
}

export const AgingReportHeader: React.FC<AgingReportHeaderProps> = ({ data }) => {
  const buckets = [
    {
      title: REPORTS_MESSAGES.aging.buckets.current,
      amount: data.summary.total_current,
      variant: 'info' as const,
    },
    {
      title: REPORTS_MESSAGES.aging.buckets.days30,
      amount: data.summary.total_30_days,
      variant: 'neutral' as const,
    },
    {
      title: REPORTS_MESSAGES.aging.buckets.days60,
      amount: data.summary.total_60_days,
      variant: 'positive' as const,
    },
    {
      title: REPORTS_MESSAGES.aging.buckets.days90Plus,
      amount: data.summary.total_90_plus,
      variant: 'negative' as const,
    },
  ]
  const statCards = [
    {
      key: 'total-outstanding',
      title: REPORTS_MESSAGES.aging.totalDebts,
      value: formatILS(data.total_outstanding),
      icon: DollarSign,
      variant: 'info' as const,
      description: REPORTS_MESSAGES.aging.openBalanceClients(data.summary.total_clients),
    },
    ...buckets.map((bucket) => ({
      key: bucket.title,
      title: bucket.title,
      value: formatILS(bucket.amount),
      icon: Clock,
      variant: bucket.variant,
      description: getBucketShare(bucket.amount, data.total_outstanding),
    })),
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <StatsCard
            key={card.key}
            title={card.title}
            value={card.value}
            icon={card.icon}
            variant={card.variant}
            description={card.description}
          />
        ))}
      </div>
    </div>
  )
}

AgingReportHeader.displayName = 'AgingReportHeader'
