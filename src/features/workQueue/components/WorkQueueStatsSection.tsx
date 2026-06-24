import { useMemo } from 'react'
import { AlertTriangle, Clock, Calendar } from 'lucide-react'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import type { WorkQueueSummary, WorkQueueUrgency } from '../api/contracts'
import { APPROACHING_DAYS, IMPORTANT_DAYS } from '../constants'
import { WORK_QUEUE_MESSAGES } from '../messages'
import { WORK_QUEUE_ERROR_MESSAGES } from '../errorMessages'

interface WorkQueueStatsSectionProps {
  summary: WorkQueueSummary | undefined
  isLoading?: boolean
  summaryError?: string | null
}

export const WorkQueueStatsSection: React.FC<WorkQueueStatsSectionProps> = ({ summary, isLoading, summaryError }) => {
  const isInitialLoading = Boolean(isLoading) && !summary
  const stats = useMemo(
    () => [
      {
        icon: AlertTriangle,
        variant: 'red' as const,
        count: summary?.overdue ?? 0,
        label: WORK_QUEUE_MESSAGES.stats.overdue,
        description: WORK_QUEUE_MESSAGES.stats.overdueDescription,
        value: 'overdue' as WorkQueueUrgency,
      },
      {
        icon: Clock,
        variant: 'orange' as const,
        count: summary?.approaching ?? 0,
        label: WORK_QUEUE_MESSAGES.stats.approaching(APPROACHING_DAYS),
        description: WORK_QUEUE_MESSAGES.stats.approachingDescription,
        value: 'approaching' as WorkQueueUrgency,
      },
      {
        icon: Clock,
        variant: 'orange' as const,
        count: summary?.important ?? 0,
        label: WORK_QUEUE_MESSAGES.stats.important(APPROACHING_DAYS + 1, IMPORTANT_DAYS),
        description: WORK_QUEUE_MESSAGES.stats.importantDescription,
        value: 'important' as WorkQueueUrgency,
      },
      {
        icon: Calendar,
        variant: 'blue' as const,
        count: summary?.upcoming ?? 0,
        label: WORK_QUEUE_MESSAGES.stats.upcoming(IMPORTANT_DAYS + 1),
        description: WORK_QUEUE_MESSAGES.stats.upcomingDescription,
        value: 'upcoming' as WorkQueueUrgency,
      },
    ],
    [summary],
  )

  if (summaryError) {
    return (
      <StateCard
        icon={AlertTriangle}
        variant="error"
        size="compact"
        title={WORK_QUEUE_ERROR_MESSAGES.stats.summaryError}
        message={summaryError}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ icon, variant, count, label, description, value }) => (
        <StatsCard
          key={value}
          title={label}
          value={count}
          description={description}
          loading={isInitialLoading}
          icon={icon}
          variant={variant}
          className="h-full w-full"
        />
      ))}
    </div>
  )
}

WorkQueueStatsSection.displayName = 'WorkQueueStatsSection'
