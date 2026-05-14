import { useMemo } from 'react'
import { AlertTriangle, Clock, Calendar } from 'lucide-react'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import type { WorkQueueSummary, WorkQueueUrgency } from '../api/contracts'
import { APPROACHING_DAYS, IMPORTANT_DAYS } from '../constants'

interface WorkQueueSummaryCardsProps {
  summary: WorkQueueSummary | undefined
  isLoading?: boolean
  summaryError?: string | null
  urgencyFilter: WorkQueueUrgency | null
  onFilter: (urgency: WorkQueueUrgency | null) => void
}

export const WorkQueueSummaryCards: React.FC<WorkQueueSummaryCardsProps> = ({
  summary,
  isLoading,
  summaryError,
  urgencyFilter,
  onFilter,
}) => {
  if (summaryError) {
    return (
      <StateCard
        icon={AlertTriangle}
        variant="error"
        size="compact"
        title="שגיאה בטעינת הסיכום"
        message={summaryError}
      />
    )
  }

  const emptyValue = !summary || isLoading ? '—' : 0
  const stats = useMemo(() => [
    {
      icon: AlertTriangle,
      variant: 'red' as const,
      count: summary?.overdue ?? emptyValue,
      label: 'באיחור',
      value: 'overdue' as WorkQueueUrgency,
    },
    {
      icon: Clock,
      variant: 'orange' as const,
      count: summary?.approaching ?? emptyValue,
      label: `דחוף (עד ${APPROACHING_DAYS} ימים)`,
      value: 'approaching' as WorkQueueUrgency,
    },
    {
      icon: Clock,
      variant: 'orange' as const,
      count: summary?.important ?? emptyValue,
      label: `חשוב (${APPROACHING_DAYS + 1}–${IMPORTANT_DAYS} ימים)`,
      value: 'important' as WorkQueueUrgency,
    },
    {
      icon: Calendar,
      variant: 'blue' as const,
      count: summary?.upcoming ?? emptyValue,
      label: `קרוב (${IMPORTANT_DAYS + 1}+ ימים)`,
      value: 'upcoming' as WorkQueueUrgency,
    },
  ], [summary, isLoading])

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ icon, variant, count, label, value }) => (
        <StatsCard
          key={value}
          title={label}
          value={count}
          icon={icon}
          variant={variant}
          selected={urgencyFilter === value}
          onClick={() => onFilter(urgencyFilter === value ? null : value)}
          className="h-full w-full"
        />
      ))}
    </div>
  )
}
