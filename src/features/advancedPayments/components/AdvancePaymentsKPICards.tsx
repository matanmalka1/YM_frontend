import { useQuery } from '@tanstack/react-query'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import { formatShekelAmount } from '@/utils/utils'
import { getCollectionPercent } from './advancePaymentComponent.utils'

interface AdvancePaymentsKPICardsProps {
  clientId: number
  year: number
}

export const AdvancePaymentsKPICards: React.FC<AdvancePaymentsKPICardsProps> = ({ clientId, year }) => {
  const { data, isLoading } = useQuery({
    queryKey: advancedPaymentsQK.kpi(clientId, year),
    queryFn: () => advancePaymentsApi.getAnnualKPIs(clientId, year),
    enabled: clientId > 0 && year > 0,
  })

  if (isLoading || !data) return null

  const collectionPct = getCollectionPercent(data.collection_rate) ?? 0

  const stats = [
    { label: 'סה״כ צפוי', value: formatShekelAmount(data.total_expected), color: 'text-blue-700' },
    { label: 'סה״כ שולם', value: formatShekelAmount(data.total_paid), color: 'text-green-700' },
    { label: 'שיעור גבייה', value: `${collectionPct}%`, color: 'text-violet-700' },
    {
      label: 'פיגורים',
      value: String(data.overdue_count),
      color: data.overdue_count > 0 ? 'text-red-600' : 'text-gray-700',
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-sm">
      {stats.map((s, i) => (
        <span key={s.label} className="flex items-center gap-1.5">
          {i > 0 && <span className="w-px h-4 bg-gray-200 hidden sm:block -mr-3" />}
          <span className="text-gray-500">{s.label}:</span>
          <span className={`font-semibold tabular-nums ${s.color}`}>{s.value}</span>
        </span>
      ))}
    </div>
  )
}

AdvancePaymentsKPICards.displayName = 'AdvancePaymentsKPICards'
