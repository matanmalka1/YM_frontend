import { Clock, CheckCircle2, FileText, XCircle } from 'lucide-react'
import type { ChargeListStats } from '../../api'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { getChargeStatusStatDisplay } from '../../utils/chargeHelpers'

interface ChargesStatsSectionProps {
  stats: ChargeListStats
  isAdvisor: boolean
  currentStatus: string
  onStatusClick: (status: string) => void
}

export const ChargesStatsSection: React.FC<ChargesStatsSectionProps> = ({
  stats,
  isAdvisor,
  currentStatus,
  onStatusClick,
}) => {
  const handleClick = (status: string) => {
    onStatusClick(currentStatus === status ? '' : status)
  }
  const statCards = [
    {
      status: 'issued',
      title: 'ממתין לגביה',
      value: getChargeStatusStatDisplay(stats.issued, isAdvisor),
      icon: Clock,
      variant: 'blue' as const,
      description: 'חיובים שהופקו וממתינים לתשלום',
    },
    {
      status: 'paid',
      title: 'שולם',
      value: getChargeStatusStatDisplay(stats.paid, isAdvisor),
      icon: CheckCircle2,
      variant: 'green' as const,
      description: 'חיובים ששולמו במלואם',
    },
    {
      status: 'draft',
      title: 'טיוטה',
      value: getChargeStatusStatDisplay(stats.draft, isAdvisor),
      icon: FileText,
      variant: 'neutral' as const,
      description: 'חיובים שטרם הופקו',
    },
    {
      status: 'canceled',
      title: 'בוטל',
      value: getChargeStatusStatDisplay(stats.canceled, isAdvisor),
      icon: XCircle,
      variant: 'red' as const,
      description: 'חיובים שבוטלו',
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
          selected={currentStatus === card.status}
          onClick={() => handleClick(card.status)}
        />
      ))}
    </div>
  )
}

ChargesStatsSection.displayName = 'ChargesStatsSection'
