import { CheckCircle2, AlertTriangle, Users } from 'lucide-react'
import { StatsCard } from '../../../../components/ui/layout/StatsCard'
import type { SeasonSummary } from '../../api'

interface SeasonSummaryCardsProps {
  summary: SeasonSummary
}

export const SeasonSummaryCards: React.FC<SeasonSummaryCardsProps> = ({ summary }) => {
  const done = summary.submitted + summary.closed
  const total = Math.max(0, summary.total)
  const completionRate = Number(summary.completion_rate)

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatsCard
        title="סה״כ דוחות"
        value={total}
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
        trend={{ value: completionRate, label: 'אחוז הגשה' }}
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
