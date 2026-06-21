import { StatsCard, type StatsCardProps } from '../../../../components/ui/layout/StatsCard'
import { formatCurrencyILS as fmt, formatPercent } from '@/utils/utils'
import { SUMMARY_CARD_META } from '../../constants/panelConstants'
import type { AnnualReportFull } from '../../api'

interface Props {
  report: AnnualReportFull
}

type StatCardConfig = Pick<StatsCardProps, 'title' | 'value' | 'description' | 'icon' | 'variant' | 'trend'> & {
  key: string
}

export const AnnualReportStatsSection: React.FC<Props> = ({ report }) => {
  const tc = report.tax_calculation
  const totalIncome = Number(tc?.total_income ?? 0)
  const grossExpenses = Number(tc?.total_expenses ?? 0)
  const recognizedExpenses = Number(tc?.recognized_expenses ?? 0)
  const netProfit = Number(tc?.profit ?? 0)
  const taxAfterCredits = Number(tc?.tax_after_credits ?? 0)
  const finalBalance = Number(tc?.final_balance ?? 0)
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
  const expenseRatio = totalIncome > 0 ? (grossExpenses / totalIncome) * 100 : 0
  const statCards: StatCardConfig[] = [
    {
      key: 'recognized-expenses',
      title: SUMMARY_CARD_META.recognizedExpenses.title,
      value: fmt(grossExpenses),
      description: `מוכר למס ${fmt(recognizedExpenses)}`,
      icon: SUMMARY_CARD_META.recognizedExpenses.icon,
      variant: SUMMARY_CARD_META.recognizedExpenses.variant,
      trend: { value: expenseRatio, label: '% מהכנסות' },
    },
    {
      key: 'final-balance',
      title: SUMMARY_CARD_META.finalBalance.title,
      value: fmt(finalBalance),
      description: finalBalance > 0 ? 'לתשלום לאחר מקדמות' : finalBalance < 0 ? 'החזר צפוי לאחר מקדמות' : 'מאוזן',
      icon: SUMMARY_CARD_META.finalBalance.icon,
      variant: finalBalance < 0 ? 'green' : finalBalance > 0 ? 'red' : 'neutral',
      trend: undefined,
    },
    {
      key: 'annual-tax',
      title: taxAfterCredits > 0 ? 'מס מחושב' : taxAfterCredits < 0 ? 'החזר מחושב' : 'מס שנתי',
      value: fmt(Math.abs(taxAfterCredits)),
      description: taxAfterCredits !== 0 ? 'לפני קיזוז מקדמות' : 'לא חושב',
      icon: SUMMARY_CARD_META.annualTax.icon,
      variant: taxAfterCredits > 0 ? 'red' : taxAfterCredits < 0 ? 'green' : 'neutral',
      trend: {
        value: totalIncome > 0 ? -(Math.abs(taxAfterCredits) / totalIncome) * 100 : 0,
        label: 'מהכנסות',
      },
    },
    {
      key: 'net-profit',
      title: SUMMARY_CARD_META.netProfit.title,
      value: fmt(netProfit),
      description: undefined,
      icon: SUMMARY_CARD_META.netProfit.icon,
      variant: SUMMARY_CARD_META.netProfit.variant,
      trend: { value: profitMargin, label: `${formatPercent(profitMargin)} שיעור רווח` },
    },
    {
      key: 'gross-income',
      title: SUMMARY_CARD_META.grossIncome.title,
      value: fmt(totalIncome),
      description: undefined,
      icon: SUMMARY_CARD_META.grossIncome.icon,
      variant: SUMMARY_CARD_META.grossIncome.variant,
      trend: undefined,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {statCards.map((card) => (
        <StatsCard
          key={card.key}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={card.icon}
          variant={card.variant}
          trend={card.trend}
        />
      ))}
    </div>
  )
}

AnnualReportStatsSection.displayName = 'AnnualReportStatsSection'
