import { Ban, CheckCircle2, CircleDot, ListChecks } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import type { TaskListResponse, TaskStatus } from '../../api/contracts'
import { TASKS_MESSAGES } from '../../messages'

interface TasksListSummaryProps {
  summary: TaskListResponse['summary'] | undefined
  activeStatus: TaskStatus | null
  onStatusChange: (status: TaskStatus | null) => void
  isLoading?: boolean
}

export const TasksListSummary: React.FC<TasksListSummaryProps> = ({ summary, activeStatus, onStatusChange, isLoading }) => (
  <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <StatsCard
      title={TASKS_MESSAGES.summary.all}
      value={summary?.total ?? 0}
      description={TASKS_MESSAGES.summary.allDescription}
      icon={ListChecks}
      loading={isLoading && !summary}
      selected={activeStatus === null}
      onClick={() => onStatusChange(null)}
    />
    <StatsCard
      title={TASKS_MESSAGES.summary.open}
      value={summary?.open ?? 0}
      icon={CircleDot}
      variant="info"
      loading={isLoading && !summary}
      selected={activeStatus === 'open'}
      onClick={() => onStatusChange(activeStatus === 'open' ? null : 'open')}
    />
    <StatsCard
      title={TASKS_MESSAGES.summary.done}
      value={summary?.done ?? 0}
      icon={CheckCircle2}
      variant="positive"
      loading={isLoading && !summary}
      selected={activeStatus === 'done'}
      onClick={() => onStatusChange(activeStatus === 'done' ? null : 'done')}
    />
    <StatsCard
      title={TASKS_MESSAGES.summary.canceled}
      value={summary?.canceled ?? 0}
      icon={Ban}
      variant="neutral"
      loading={isLoading && !summary}
      selected={activeStatus === 'canceled'}
      onClick={() => onStatusChange(activeStatus === 'canceled' ? null : 'canceled')}
    />
  </section>
)
