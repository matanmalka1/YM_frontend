import { CheckCircle2, AlertTriangle, Users } from 'lucide-react'
import { StatsCard } from '../../../../components/ui/layout/StatsCard'
import type { SeasonSummary } from '../../api'

interface SeasonSummaryCardsProps {
  summary: SeasonSummary
}

export const SeasonSummaryCards: React.FC<SeasonSummaryCardsProps> = ({ summary }) => {
  const done = summary.submitted + summary.closed

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatsCard
        title="סה״כ דוחות"
        value={summary.total}
        description={`שנת מס ${summary.tax_year}`}
        icon={Users}
        variant="blue"
      />
      <StatsCard
        title="הוגשו / הסתיימו"
        value={done}
        description={`${summary.completion_rate}% מכלל הדוחות`}
        icon={CheckCircle2}
        variant="green"
        trend={{ value: summary.completion_rate, label: 'אחוז הגשה' }}
      />
      <StatsCard
        title="באיחור"
        value={summary.overdue_count}
        description="חרגו ממועד הגשה"
        icon={AlertTriangle}
        variant={summary.overdue_count > 0 ? 'red' : 'neutral'}
      />
    </div>
  )
}
