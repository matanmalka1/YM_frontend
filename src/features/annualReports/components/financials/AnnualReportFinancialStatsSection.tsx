import { StatsCard } from '../../../../components/ui/layout/StatsCard'
import { formatCurrencyILS as fmt } from '../../../../utils/utils'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface AnnualReportFinancialStatsSectionProps {
  totalIncome: number
  totalExpenses: number
  taxableIncome: number
}

export const AnnualReportFinancialStatsSection: React.FC<AnnualReportFinancialStatsSectionProps> = ({
  totalIncome,
  totalExpenses,
  taxableIncome,
}) => {
  const statCards = [
    {
      key: 'income',
      title: ANNUAL_REPORTS_MESSAGES.financialStats.totalIncome,
      value: fmt(totalIncome),
      variant: 'positive' as const,
    },
    {
      key: 'expenses',
      title: ANNUAL_REPORTS_MESSAGES.financialStats.totalExpenses,
      value: fmt(totalExpenses),
      variant: 'negative' as const,
    },
    {
      key: 'taxable-income',
      title: ANNUAL_REPORTS_MESSAGES.financialStats.taxableIncome,
      value: fmt(taxableIncome),
      variant: taxableIncome >= 0 ? ('info' as const) : ('negative' as const),
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {statCards.map((card) => (
        <StatsCard key={card.key} title={card.title} value={card.value} variant={card.variant} />
      ))}
    </div>
  )
}

AnnualReportFinancialStatsSection.displayName = 'AnnualReportFinancialStatsSection'
