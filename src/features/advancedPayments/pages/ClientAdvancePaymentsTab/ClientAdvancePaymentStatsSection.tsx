import { TrendingUp, Wallet, BarChart2, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { advancePaymentsApi, advancedPaymentsQK } from '../../api'
import { formatShekelAmount } from '@/utils/utils'
import { getCollectionPercent } from '../../utils/advancePaymentComponentUtils'

interface ClientAdvancePaymentStatsSectionProps {
  clientRecordId: number
  year: number
}

export const ClientAdvancePaymentStatsSection: React.FC<ClientAdvancePaymentStatsSectionProps> = ({
  clientRecordId,
  year,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: advancedPaymentsQK.kpi(clientRecordId, year),
    queryFn: () => advancePaymentsApi.getAnnualKPIs(clientRecordId, year),
    enabled: clientRecordId > 0 && year > 0,
  })

  const collectionPct = getCollectionPercent(data?.collection_rate ?? null) ?? 0
  const statCards = [
    {
      key: 'total-expected',
      title: 'סה״כ צפוי',
      value: data ? formatShekelAmount(data.total_expected) : '—',
      icon: BarChart2,
      variant: 'blue' as const,
    },
    {
      key: 'total-paid',
      title: 'סה״כ שולם',
      value: data ? formatShekelAmount(data.total_paid) : '—',
      icon: Wallet,
      variant: 'green' as const,
    },
    {
      key: 'collection-rate',
      title: 'שיעור גבייה',
      value: data ? `${collectionPct}%` : '—',
      icon: TrendingUp,
      variant: 'purple' as const,
    },
    {
      key: 'overdue',
      title: 'פיגורים',
      value: data?.overdue_count ?? 0,
      icon: AlertCircle,
      variant: data && data.overdue_count > 0 ? ('red' as const) : ('neutral' as const),
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
      {statCards.map((card) => (
        <StatsCard
          key={card.key}
          title={card.title}
          value={card.value}
          icon={card.icon}
          variant={card.variant}
          loading={isLoading}
        />
      ))}
    </div>
  )
}

ClientAdvancePaymentStatsSection.displayName = 'ClientAdvancePaymentStatsSection'
