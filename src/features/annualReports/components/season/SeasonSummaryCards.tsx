import { CheckCircle2, AlertTriangle, Users } from 'lucide-react'
import { StatsCard } from '../../../../components/ui/layout/StatsCard'
import { formatPercent } from '@/utils/utils'
import type { SeasonSummary } from '../../api'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface SeasonSummaryCardsProps {
  summary: SeasonSummary
}

export const SeasonSummaryCards: React.FC<SeasonSummaryCardsProps> = ({ summary }) => {
  const done = summary.submitted + summary.closed
  const total = Math.max(0, summary.total)
  const completionRate = Number(summary.completion_rate)
  const statCards = [
    {
      key: 'total',
      title: ANNUAL_REPORTS_MESSAGES.season.totalReports,
      value: total,
      description: ANNUAL_REPORTS_MESSAGES.season.progressSubtitle(summary.tax_year),
      icon: Users,
      variant: 'info' as const,
      progress: undefined,
    },
    {
      key: 'completed',
      title: ANNUAL_REPORTS_MESSAGES.season.submittedOrClosed,
      value: done,
      description: ANNUAL_REPORTS_MESSAGES.season.filingPercentNote(formatPercent(completionRate)),
      icon: CheckCircle2,
      variant: 'positive' as const,
      progress: completionRate,
    },
    {
      key: 'overdue',
      title: ANNUAL_REPORTS_MESSAGES.season.overdue,
      value: summary.overdue_count,
      description: ANNUAL_REPORTS_MESSAGES.season.overdueNote,
      icon: AlertTriangle,
      variant: summary.overdue_count > 0 ? ('negative' as const) : ('neutral' as const),
      progress: undefined,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {statCards.map((card) => (
        <StatsCard
          key={card.key}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={card.icon}
          variant={card.variant}
          progress={card.progress}
        />
      ))}
    </div>
  )
}
