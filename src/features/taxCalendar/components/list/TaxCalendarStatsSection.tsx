import { CalendarDays, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { cn } from '../../../../utils/utils'
import type { TaxCalendarGroupsSummary } from '../../api'
import { TAX_CALENDAR_MESSAGES } from '../../messages'

interface TaxCalendarStatsSectionProps {
  summary: TaxCalendarGroupsSummary
  linkedLabel: string
  showGroupsCount?: boolean
}

export const TaxCalendarStatsSection = ({
  summary,
  linkedLabel,
  showGroupsCount = false,
}: TaxCalendarStatsSectionProps) => {
  const items = [
    ...(showGroupsCount
      ? [
          {
            key: 'groups',
            label: TAX_CALENDAR_MESSAGES.stats.groups,
            value: summary.groups,
            icon: CalendarDays,
            variant: 'info' as const,
            description: TAX_CALENDAR_MESSAGES.stats.groupsDescription,
          },
        ]
      : []),
    {
      key: 'linked',
      label: linkedLabel,
      value: summary.linked,
      icon: CalendarDays,
      variant: 'info' as const,
      description: TAX_CALENDAR_MESSAGES.stats.linkedDescription,
    },
    {
      key: 'open',
      label: TAX_CALENDAR_MESSAGES.status.open,
      value: summary.open,
      icon: Clock,
      variant: 'warning' as const,
      description: TAX_CALENDAR_MESSAGES.stats.openDescription,
    },
    {
      key: 'overdue',
      label: TAX_CALENDAR_MESSAGES.status.overdue,
      value: summary.overdue,
      icon: AlertTriangle,
      variant: 'negative' as const,
      description: TAX_CALENDAR_MESSAGES.stats.overdueDescription,
    },
    {
      key: 'done',
      label: TAX_CALENDAR_MESSAGES.status.done,
      value: summary.done,
      icon: CheckCircle2,
      variant: 'positive' as const,
      description: TAX_CALENDAR_MESSAGES.stats.doneDescription,
    },
  ]

  return (
    <div
      className={cn('grid grid-cols-2 gap-3', items.length === 5 ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-4')}
    >
      {items.map((item) => (
        <StatsCard
          key={item.key}
          title={item.label}
          value={item.value}
          icon={item.icon}
          variant={item.variant}
          description={item.description}
        />
      ))}
    </div>
  )
}

TaxCalendarStatsSection.displayName = 'TaxCalendarStatsSection'
