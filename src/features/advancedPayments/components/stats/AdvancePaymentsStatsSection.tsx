import { AlertTriangle, CalendarClock, Clock, ListChecks } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentsStatsSectionProps {
  dueThisMonthCount: number
  pendingCount: number
  missingTurnoverCount: number
  overdueCount: number
}

export const AdvancePaymentsStatsSection: React.FC<AdvancePaymentsStatsSectionProps> = ({
  dueThisMonthCount,
  pendingCount,
  missingTurnoverCount,
  overdueCount,
}) => {
  const statCards = [
    {
      key: 'due-this-month',
      title: ADVANCED_PAYMENTS_MESSAGES.stats.dueThisMonthTitle,
      value: dueThisMonthCount,
      icon: CalendarClock,
      variant: 'info' as const,
      description: ADVANCED_PAYMENTS_MESSAGES.stats.dueThisMonthDescription,
    },
    {
      key: 'pending',
      title: ADVANCED_PAYMENTS_MESSAGES.stats.pendingTitle,
      value: pendingCount,
      icon: ListChecks,
      variant: 'warning' as const,
      description: ADVANCED_PAYMENTS_MESSAGES.stats.pendingDescription,
    },
    {
      key: 'missing-turnover',
      title: ADVANCED_PAYMENTS_MESSAGES.stats.missingTurnoverTitle,
      value: missingTurnoverCount,
      icon: AlertTriangle,
      variant: 'warning' as const,
      description: ADVANCED_PAYMENTS_MESSAGES.stats.missingTurnoverDescription,
    },
    {
      key: 'overdue',
      title: ADVANCED_PAYMENTS_MESSAGES.stats.overdueTitle,
      value: overdueCount,
      icon: Clock,
      variant: 'negative' as const,
      description: ADVANCED_PAYMENTS_MESSAGES.stats.overdueDescription,
    },
  ] as const

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
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

AdvancePaymentsStatsSection.displayName = 'AdvancePaymentsStatsSection'
