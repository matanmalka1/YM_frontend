import { Activity, CheckCircle2, MinusCircle, ReceiptText, WalletCards } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import type { VatAnnualSummary } from '../../api'
import { formatVatAmount } from '../../utils/vatHelpers'

interface VatClientSummaryStatsSectionProps {
  annual: VatAnnualSummary
}

export const VatClientSummaryStatsSection = ({ annual }: VatClientSummaryStatsSectionProps) => {
  const averageNetVat = annual.periods_count > 0 ? Number(annual.net_vat) / annual.periods_count : null
  const statCards = [
    {
      key: 'filed-periods',
      title: 'תקופות שהוגשו',
      value: `${annual.filed_count} מתוך ${annual.periods_count}`,
      icon: CheckCircle2,
      variant: 'green' as const,
    },
    {
      key: 'output-vat',
      title: 'מע״מ עסקאות',
      value: formatVatAmount(annual.total_output_vat),
      icon: ReceiptText,
      variant: 'neutral' as const,
    },
    {
      key: 'input-vat',
      title: 'מע״מ תשומות',
      value: formatVatAmount(annual.total_input_vat),
      icon: MinusCircle,
      variant: 'neutral' as const,
    },
    {
      key: 'net-vat',
      title: 'מע״מ נטו לתשלום',
      value: formatVatAmount(annual.net_vat),
      icon: WalletCards,
      variant: Number(annual.net_vat) >= 0 ? ('red' as const) : ('green' as const),
    },
    {
      key: 'average-vat',
      title: 'מע״מ ממוצע לתקופה',
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
