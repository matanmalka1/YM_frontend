import { CheckCircle2, Clock, FileText, Hourglass } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { VAT_MESSAGES } from '../../messages'

interface VatWorkItemsStatsSectionProps {
  stats: {
    pending: number
    typing: number
    review: number
    filed: number
  }
}

export const VatWorkItemsStatsSection = ({ stats }: VatWorkItemsStatsSectionProps) => {
  const statCards = [
    {
      key: 'pending',
      title: VAT_MESSAGES.stats.pendingTitle,
      value: stats.pending,
      icon: Hourglass,
      variant: 'orange' as const,
      description: VAT_MESSAGES.stats.pendingDescription,
    },
    {
      key: 'typing',
      title: VAT_MESSAGES.stats.typingTitle,
      value: stats.typing,
      icon: Clock,
      variant: 'blue' as const,
      description: VAT_MESSAGES.stats.typingDescription,
    },
    {
      key: 'review',
      title: VAT_MESSAGES.stats.reviewTitle,
      value: stats.review,
      icon: FileText,
      variant: 'orange' as const,
      description: VAT_MESSAGES.stats.reviewDescription,
    },
    {
      key: 'filed',
      title: VAT_MESSAGES.stats.filedTitle,
      value: stats.filed,
      icon: CheckCircle2,
      variant: 'green' as const,
      description: VAT_MESSAGES.stats.filedDescription,
    },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statCards.map((card) => (
        <StatsCard
          key={card.key}
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

VatWorkItemsStatsSection.displayName = 'VatWorkItemsStatsSection'
