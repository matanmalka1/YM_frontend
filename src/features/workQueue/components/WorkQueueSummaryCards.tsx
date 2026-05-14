import { AlertTriangle, Clock, Calendar, CheckSquare, Link2 } from 'lucide-react'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import type { WorkQueueSummary, WorkQueueUrgency } from '../api/contracts'

interface WorkQueueSummaryCardsProps {
  summary: WorkQueueSummary | undefined
  isLoading?: boolean
  summaryError?: string | null
  urgencyFilter: WorkQueueUrgency | null
  onFilter: (urgency: WorkQueueUrgency | null) => void
  scopeFilter: 'system' | 'manual' | null
  linkedFilter: 'linked' | 'unlinked' | null
  onScopeFilter: (filter: 'system' | 'manual' | null) => void
  onLinkedFilter: (filter: 'linked' | 'unlinked' | null) => void
}

export const WorkQueueSummaryCards: React.FC<WorkQueueSummaryCardsProps> = ({
  summary,
  isLoading,
  summaryError,
  urgencyFilter,
  onFilter,
  scopeFilter,
  linkedFilter,
  onScopeFilter,
  onLinkedFilter,
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
  const stats = [
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
      label: 'דחוף (עד 7 ימים)',
      value: 'approaching' as WorkQueueUrgency,
    },
    {
      icon: Clock,
      variant: 'orange' as const,
      count: summary?.important ?? emptyValue,
      label: 'חשוב (8–21 ימים)',
      value: 'important' as WorkQueueUrgency,
    },
    {
      icon: Calendar,
      variant: 'blue' as const,
      count: summary?.upcoming ?? emptyValue,
      label: 'קרוב (22+ ימים)',
      value: 'upcoming' as WorkQueueUrgency,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
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
      <StatsCard
        title="משימות ידניות"
        value={summary?.manual_tasks ?? emptyValue}
        icon={CheckSquare}
        variant="blue"
        selected={scopeFilter === 'manual'}
        onClick={() => onScopeFilter(scopeFilter === 'manual' ? null : 'manual')}
        className="h-full w-full"
      />
      <StatsCard
        title="עם משימה קשורה"
        value={summary?.linked ?? emptyValue}
        icon={Link2}
        variant="green"
        selected={linkedFilter === 'linked'}
        onClick={() => onLinkedFilter(linkedFilter === 'linked' ? null : 'linked')}
        className="h-full w-full"
      />
    </div>
  )
}
