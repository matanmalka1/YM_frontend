import { Card } from '../../../../components/ui/primitives/Card'
import type { SeasonSummary } from '../../api'
import { SEASON_PROGRESS_STAGES } from '../../api'
import { cn } from '../../../../utils/utils'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface SeasonProgressBarProps {
  summary: SeasonSummary
}

export const SeasonProgressBar: React.FC<SeasonProgressBarProps> = ({ summary }) => {
  const total = summary.total || 1

  return (
    <Card variant="elevated" title={ANNUAL_REPORTS_MESSAGES.season.progressTitle} subtitle={ANNUAL_REPORTS_MESSAGES.season.progressSubtitle(summary.tax_year)}>
      {/* Stacked progress bar */}
      <div className="mb-6 h-5 w-full overflow-hidden rounded-full bg-gray-100 flex">
        {SEASON_PROGRESS_STAGES.map((stage) => {
          const count = (summary[stage.key as keyof SeasonSummary] as number) ?? 0
          const pct = (count / total) * 100
          if (pct === 0) return null
          return (
            <div
              key={stage.key}
              className={cn('transition-all duration-700', stage.color)}
              style={{ width: `${pct}%` }}
              title={`${stage.label}: ${count}`}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {SEASON_PROGRESS_STAGES.map((stage) => {
          const count = (summary[stage.key as keyof SeasonSummary] as number) ?? 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={stage.key} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className={cn('h-3 w-3 rounded-full flex-shrink-0', stage.color)} />
                <span className="text-xs text-gray-600 truncate">{stage.label}</span>
              </div>
              <div className="flex items-baseline gap-1 pr-4">
                <span className="text-lg font-bold text-gray-900">{count}</span>
                <span className="text-xs text-gray-500">({pct}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
