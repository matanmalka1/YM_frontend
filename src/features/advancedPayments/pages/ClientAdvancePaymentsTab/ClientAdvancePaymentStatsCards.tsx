import { TrendingUp, Wallet, BarChart2, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { advancePaymentsApi, advancedPaymentsQK } from '../../api'
import { formatShekelAmount } from '@/utils/utils'
import { getCollectionPercent } from '../../components/advancePaymentComponent.utils'

interface ClientAdvancePaymentStatsCardsProps {
  clientRecordId: number
  year: number
}

export const ClientAdvancePaymentStatsCards: React.FC<ClientAdvancePaymentStatsCardsProps> = ({ clientRecordId, year }) => {
  const { data, isLoading } = useQuery({
    queryKey: advancedPaymentsQK.kpi(clientRecordId, year),
    queryFn: () => advancePaymentsApi.getAnnualKPIs(clientRecordId, year),
    enabled: clientRecordId > 0 && year > 0,
  })

  const collectionPct = getCollectionPercent(data?.collection_rate ?? null) ?? 0

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
      <StatsCard
        title="סה״כ צפוי"
        value={data ? formatShekelAmount(data.total_expected) : '—'}
        icon={BarChart2}
        variant="blue"
        loading={isLoading}
      />
      <StatsCard
        title="סה״כ שולם"
        value={data ? formatShekelAmount(data.total_paid) : '—'}
        icon={Wallet}
        variant="green"
        loading={isLoading}
      />
      <StatsCard
        title="שיעור גבייה"
        value={data ? `${collectionPct}%` : '—'}
        icon={TrendingUp}
        variant="purple"
        loading={isLoading}
      />
      <StatsCard
        title="פיגורים"
        value={data?.overdue_count ?? 0}
        icon={AlertCircle}
        variant={data && data.overdue_count > 0 ? 'red' : 'neutral'}
        loading={isLoading}
      />
    </div>
  )
}

ClientAdvancePaymentStatsCards.displayName = 'ClientAdvancePaymentStatsCards'
