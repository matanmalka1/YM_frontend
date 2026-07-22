import { useMemo } from 'react'
import { AlertTriangle, Clock, Calendar, ClipboardList, ListChecks, Link2 } from 'lucide-react'
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
  activeUrgency?: WorkQueueUrgency | null
  onUrgencyChange?: (urgency: WorkQueueUrgency | null) => void
}

export const WorkQueueStatsSection: React.FC<WorkQueueStatsSectionProps> = ({
  summary,
  isLoading,
  summaryError,
  activeUrgency,
  onUrgencyChange,
}) => {
  const isInitialLoading = Boolean(isLoading) && !summary
  const stats = useMemo(
    () => [
      {
        icon: AlertTriangle,
        variant: 'negative' as const,
        count: summary?.overdue ?? 0,
        label: WORK_QUEUE_MESSAGES.stats.overdue,
        description: WORK_QUEUE_MESSAGES.stats.overdueDescription,
        value: 'overdue' as WorkQueueUrgency,
      },
      {
        icon: Clock,
        variant: 'warning' as const,
        count: summary?.approaching ?? 0,
        label: WORK_QUEUE_MESSAGES.stats.approaching(APPROACHING_DAYS),
        description: WORK_QUEUE_MESSAGES.stats.approachingDescription,
        value: 'approaching' as WorkQueueUrgency,
      },
      {
        icon: Clock,
        variant: 'warning' as const,
        count: summary?.important ?? 0,
        label: WORK_QUEUE_MESSAGES.stats.important(APPROACHING_DAYS + 1, IMPORTANT_DAYS),
        description: WORK_QUEUE_MESSAGES.stats.importantDescription,
        value: 'important' as WorkQueueUrgency,
      },
      {
        icon: Calendar,
        variant: 'info' as const,
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

  const composition = [
    {
      icon: ClipboardList,
      title: WORK_QUEUE_MESSAGES.stats.systemWork,
      value: Math.max(0, (summary?.total ?? 0) - (summary?.manual_tasks ?? 0)),
      description: WORK_QUEUE_MESSAGES.stats.systemWorkDescription,
    },
    {
      icon: ListChecks,
      title: WORK_QUEUE_MESSAGES.stats.manualTasks,
      value: summary?.manual_tasks ?? 0,
      description: WORK_QUEUE_MESSAGES.stats.manualTasksDescription,
    },
    {
      icon: Link2,
      title: WORK_QUEUE_MESSAGES.stats.linkedWork,
      value: summary?.linked ?? 0,
      description: WORK_QUEUE_MESSAGES.stats.linkedWorkDescription,
    },
  ]

  return (
    <div className="space-y-3">
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
            selected={activeUrgency === value}
            onClick={onUrgencyChange ? () => onUrgencyChange(activeUrgency === value ? null : value) : undefined}
            className="h-full w-full"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {composition.map((item) => (
          <StatsCard key={item.title} {...item} loading={isInitialLoading} variant="neutral" className="h-full w-full" />
        ))}
      </div>
    </div>
  )
}

WorkQueueStatsSection.displayName = 'WorkQueueStatsSection'
