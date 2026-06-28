import { Clock, CheckCircle2, FileText, XCircle } from 'lucide-react'
import type { ChargeListStats } from '../../api'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { getChargeStatusStatDisplay } from '../../utils/chargeHelpers'
import { CHARGES_MESSAGES } from '../../messages'

interface ChargesStatsSectionProps {
  stats: ChargeListStats
  isAdvisor: boolean
}

export const ChargesStatsSection: React.FC<ChargesStatsSectionProps> = ({ stats, isAdvisor }) => {
  const statCards = [
    {
      status: 'issued',
      title: CHARGES_MESSAGES.stats.pendingTitle,
      value: getChargeStatusStatDisplay(stats.issued, isAdvisor),
      icon: Clock,
      variant: 'info' as const,
      description: CHARGES_MESSAGES.stats.pendingDescription,
    },
    {
      status: 'paid',
      title: CHARGES_MESSAGES.stats.paidTitle,
      value: getChargeStatusStatDisplay(stats.paid, isAdvisor),
      icon: CheckCircle2,
      variant: 'positive' as const,
      description: CHARGES_MESSAGES.stats.paidDescription,
    },
    {
      status: 'draft',
      title: CHARGES_MESSAGES.stats.draftTitle,
      value: getChargeStatusStatDisplay(stats.draft, isAdvisor),
      icon: FileText,
      variant: 'neutral' as const,
      description: CHARGES_MESSAGES.stats.draftDescription,
    },
    {
      status: 'canceled',
      title: CHARGES_MESSAGES.stats.canceledTitle,
      value: getChargeStatusStatDisplay(stats.canceled, isAdvisor),
      icon: XCircle,
      variant: 'negative' as const,
      description: CHARGES_MESSAGES.stats.canceledDescription,
    },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statCards.map((card) => (
        <StatsCard
          key={card.status}
          title={card.title}
          value={card.value}
          icon={card.icon}
          variant={card.variant}
          description={card.description}
        />
      ))}
    </div>
  )
}

ChargesStatsSection.displayName = 'ChargesStatsSection'
