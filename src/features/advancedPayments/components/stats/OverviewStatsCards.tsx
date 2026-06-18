import { AlertTriangle, CalendarClock, Clock, ListChecks } from 'lucide-react'
import { StatsCard } from '../../../../components/ui/layout/StatsCard'

interface OverviewStatsCardsProps {
  dueThisMonthCount: number
  pendingCount: number
  missingTurnoverCount: number
  overdueCount: number
}

export const OverviewStatsCards: React.FC<OverviewStatsCardsProps> = ({
  dueThisMonthCount,
  pendingCount,
  missingTurnoverCount,
  overdueCount,
}) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
      <StatsCard
        title="לתשלום החודש"
        value={dueThisMonthCount}
        icon={CalendarClock}
        variant="blue"
        description="מקדמות לתקופה הנוכחית"
      />
      <StatsCard
        title="לקוחות ממתינים"
        value={pendingCount}
        icon={ListChecks}
        variant="orange"
        description="בסינון השנה הנוכחי"
      />
      <StatsCard
        title="חסרי מחזור"
        value={missingTurnoverCount}
        icon={AlertTriangle}
        variant="orange"
        description="בסינון השנה הנוכחי"
      />
      <StatsCard title="באיחור" value={overdueCount} icon={Clock} variant="red" description="בסינון השנה הנוכחי" />
    </div>
  )
}

