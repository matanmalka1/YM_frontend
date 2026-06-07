import { StatsCard } from '../../../../components/ui/layout/StatsCard'
import { formatCurrencyILS as fmt } from '@/utils/utils'
import { SUMMARY_CARD_META } from './constants'
import type { AnnualReportFull } from '../../api'

interface Props {
  report: AnnualReportFull
}

export const ReportSummaryCards: React.FC<Props> = ({ report }) => {
  const totalIncome = Number(report.total_income ?? 0)
  const grossExpenses = Number(report.total_expenses ?? 0)
  const recognizedExpenses = Number(report.recognized_expenses ?? 0)
  const netProfit = Number(report.profit ?? 0)
  const taxAfterCredits = Number(report.tax_after_credits ?? 0)
  const finalBalance = Number(report.final_balance ?? 0)
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
  const expenseRatio = totalIncome > 0 ? (grossExpenses / totalIncome) * 100 : 0
  const balanceLabel =
    finalBalance > 0 ? 'לתשלום לאחר מקדמות' : finalBalance < 0 ? 'החזר צפוי לאחר מקדמות' : 'מאוזן'
  const balanceVariant = finalBalance < 0 ? 'green' : finalBalance > 0 ? 'red' : 'neutral'

  const hasTaxDue = taxAfterCredits > 0
  const annualTaxTitle = hasTaxDue ? 'מס מחושב' : taxAfterCredits < 0 ? 'החזר מחושב' : 'מס שנתי'
  const annualTaxVariant = hasTaxDue ? 'red' : taxAfterCredits < 0 ? 'green' : 'neutral'
  const annualTaxDescription = taxAfterCredits !== 0 ? 'לפני קיזוז מקדמות' : 'לא חושב'

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatsCard
        title={SUMMARY_CARD_META.recognizedExpenses.title}
        value={fmt(grossExpenses)}
        description={`מוכר למס ${fmt(recognizedExpenses)}`}
        icon={SUMMARY_CARD_META.recognizedExpenses.icon}
        variant={SUMMARY_CARD_META.recognizedExpenses.variant}
        trend={{ value: expenseRatio, label: '% מהכנסות' }}
      />

      <StatsCard
        title={SUMMARY_CARD_META.finalBalance.title}
        value={fmt(finalBalance)}
        description={balanceLabel}
        icon={SUMMARY_CARD_META.finalBalance.icon}
        variant={balanceVariant}
      />

      <StatsCard
        title={annualTaxTitle}
        value={fmt(Math.abs(taxAfterCredits))}
        description={annualTaxDescription}
        icon={SUMMARY_CARD_META.annualTax.icon}
        variant={annualTaxVariant}
        trend={{
          value: totalIncome > 0 ? -(Math.abs(taxAfterCredits) / totalIncome) * 100 : 0,
          label: 'מהכנסות',
        }}
      />

      <StatsCard
        title={SUMMARY_CARD_META.netProfit.title}
        value={fmt(netProfit)}
        icon={SUMMARY_CARD_META.netProfit.icon}
        variant={SUMMARY_CARD_META.netProfit.variant}
        trend={{ value: profitMargin, label: `${profitMargin.toFixed(1)}% שיעור רווח` }}
      />

      <StatsCard
        title={SUMMARY_CARD_META.grossIncome.title}
        value={fmt(totalIncome)}
        icon={SUMMARY_CARD_META.grossIncome.icon}
        variant={SUMMARY_CARD_META.grossIncome.variant}
      />
    </div>
  )
}
