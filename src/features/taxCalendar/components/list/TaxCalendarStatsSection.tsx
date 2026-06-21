import { CalendarDays, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import type { TaxCalendarGroupsSummary } from '../../api'

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
            label: 'סה״כ קבוצות',
            value: summary.groups,
            icon: CalendarDays,
            variant: 'blue' as const,
            description: 'קבוצות מועדי המס שנמצאו',
          },
        ]
      : []),
    {
      key: 'linked',
      label: linkedLabel,
      value: summary.linked,
      icon: CalendarDays,
      variant: 'blue' as const,
      description: 'מועדים המשויכים ללקוחות',
    },
    {
      key: 'open',
      label: 'פתוחים',
      value: summary.open,
      icon: Clock,
      variant: 'orange' as const,
      description: 'מועדים שטרם הושלמו',
    },
    {
      key: 'overdue',
      label: 'באיחור',
      value: summary.overdue,
      icon: AlertTriangle,
      variant: 'red' as const,
      description: 'מועדים שתאריך היעד שלהם חלף',
    },
    {
      key: 'done',
      label: 'הושלמו',
      value: summary.done,
      icon: CheckCircle2,
      variant: 'green' as const,
      description: 'מועדים שהטיפול בהם הסתיים',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
