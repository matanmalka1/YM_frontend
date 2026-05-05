import { AlertTriangle, CalendarClock, Clock, ListChecks } from 'lucide-react'
import { StatsCard } from '../../../components/ui/layout/StatsCard'

interface OverviewKPICardsProps {
  dueThisMonthCount: number
  pendingCount: number
  missingTurnoverCount: number
  overdueCount: number
}

export const OverviewKPICards: React.FC<OverviewKPICardsProps> = ({
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
        description="מועדים קרובים"
      />
      <StatsCard
        title="לקוחות ממתינים"
        value={pendingCount}
        icon={ListChecks}
        variant="orange"
        description="דורשים טיפול"
      />
      <StatsCard
        title="חסרי מחזור"
        value={missingTurnoverCount}
        icon={AlertTriangle}
        variant="orange"
        description="לא ניתן לחשב מקדמה"
      />
      <StatsCard title="באיחור" value={overdueCount} icon={Clock} variant="red" description="עבר תאריך יעד" />
    </div>
  )
}

OverviewKPICards.displayName = 'OverviewKPICards'
