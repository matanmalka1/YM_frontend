import { Activity, CheckCircle2, MinusCircle, ReceiptText, WalletCards } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import type { VatAnnualSummary } from '../../api'
import { formatVatAmount } from '../../utils/vatHelpers'
import { VAT_MESSAGES } from '../../messages'

interface VatClientSummaryStatsSectionProps {
  annual: VatAnnualSummary
}

export const VatClientSummaryStatsSection = ({ annual }: VatClientSummaryStatsSectionProps) => {
  const averageNetVat = annual.periods_count > 0 ? Number(annual.net_vat) / annual.periods_count : null
  const statCards = [
    {
      key: 'filed-periods',
      title: VAT_MESSAGES.clientSummary.filedPeriods,
      value: VAT_MESSAGES.clientSummary.filedPeriodsValue(annual.filed_count, annual.periods_count),
      icon: CheckCircle2,
      variant: 'green' as const,
    },
    {
      key: 'output-vat',
      title: VAT_MESSAGES.clientSummary.outputVat,
      value: formatVatAmount(annual.total_output_vat),
      icon: ReceiptText,
      variant: 'neutral' as const,
    },
    {
      key: 'input-vat',
      title: VAT_MESSAGES.clientSummary.inputVat,
      value: formatVatAmount(annual.total_input_vat),
      icon: MinusCircle,
      variant: 'neutral' as const,
    },
    {
      key: 'net-vat',
      title: VAT_MESSAGES.clientSummary.netVatPayable,
      value: formatVatAmount(annual.net_vat),
      icon: WalletCards,
      variant: Number(annual.net_vat) >= 0 ? ('red' as const) : ('green' as const),
    },
    {
      key: 'average-vat',
      title: VAT_MESSAGES.clientSummary.averageVatPerPeriod,
      value: averageNetVat !== null ? formatVatAmount(averageNetVat) : '—',
      icon: Activity,
      variant: 'neutral' as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {statCards.map((card) => (
        <StatsCard key={card.key} title={card.title} value={card.value} icon={card.icon} variant={card.variant} />
      ))}
    </div>
  )
}

VatClientSummaryStatsSection.displayName = 'VatClientSummaryStatsSection'
