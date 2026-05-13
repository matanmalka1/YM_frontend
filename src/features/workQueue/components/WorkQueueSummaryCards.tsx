import { AlertTriangle, Clock, Calendar, CheckSquare, Link2 } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import type { WorkQueueItem, WorkQueueUrgency } from '../api/contracts'

interface WorkQueueSummaryCardsProps {
  items: WorkQueueItem[]
  urgencyFilter: WorkQueueUrgency | null
  onFilter: (urgency: WorkQueueUrgency | null) => void
  specialFilter: 'manual' | 'linked' | null
  onSpecialFilter: (filter: 'manual' | 'linked' | null) => void
}

export const WorkQueueSummaryCards: React.FC<WorkQueueSummaryCardsProps> = ({
  items,
  urgencyFilter,
  onFilter,
  specialFilter,
  onSpecialFilter,
}) => {
  const overdue = items.filter((i) => i.urgency === 'overdue').length
  const approaching = items.filter((i) => i.urgency === 'approaching').length
  const important = items.filter((i) => i.urgency === 'important').length
  const upcoming = items.filter((i) => i.urgency === 'upcoming').length
  const manual = items.filter((i) => i.source_type === 'task').length
  const linked = items.filter((i) => i.linked_tasks_count > 0).length

  const stats = [
    {
      icon: AlertTriangle,
      variant: 'red' as const,
      count: overdue,
      label: 'באיחור',
      value: 'overdue' as WorkQueueUrgency,
    },
    {
      icon: Clock,
      variant: 'orange' as const,
      count: approaching,
      label: 'דחוף (עד 7 ימים)',
      value: 'approaching' as WorkQueueUrgency,
    },
    {
      icon: Clock,
      variant: 'orange' as const,
      count: important,
      label: 'חשוב (8–21 ימים)',
      value: 'important' as WorkQueueUrgency,
    },
    {
      icon: Calendar,
      variant: 'blue' as const,
      count: upcoming,
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
        value={manual}
        icon={CheckSquare}
        variant="blue"
        selected={specialFilter === 'manual'}
        onClick={() => onSpecialFilter(specialFilter === 'manual' ? null : 'manual')}
        className="h-full w-full"
      />
      <StatsCard
        title="עם משימה קשורה"
        value={linked}
        icon={Link2}
        variant="green"
        selected={specialFilter === 'linked'}
        onClick={() => onSpecialFilter(specialFilter === 'linked' ? null : 'linked')}
        className="h-full w-full"
      />
    </div>
  )
}
