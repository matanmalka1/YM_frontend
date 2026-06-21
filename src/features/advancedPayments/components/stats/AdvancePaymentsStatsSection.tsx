import { AlertTriangle, CalendarClock, Clock, ListChecks } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'

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
      title: 'לתשלום החודש',
      value: dueThisMonthCount,
      icon: CalendarClock,
      variant: 'blue' as const,
      description: 'מקדמות לתקופה הנוכחית',
    },
    {
      key: 'pending',
      title: 'לקוחות ממתינים',
      value: pendingCount,
      icon: ListChecks,
      variant: 'orange' as const,
      description: 'בסינון השנה הנוכחי',
    },
    {
      key: 'missing-turnover',
      title: 'חסרי מחזור',
      value: missingTurnoverCount,
      icon: AlertTriangle,
      variant: 'orange' as const,
      description: 'בסינון השנה הנוכחי',
    },
    {
      key: 'overdue',
      title: 'באיחור',
      value: overdueCount,
      icon: Clock,
      variant: 'red' as const,
      description: 'בסינון השנה הנוכחי',
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
