import { AlertTriangle, CalendarDays, ListChecks } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'

interface TaxCalendarSettingsStatsSectionProps {
  yearRange: string
  totalEntries: number
  warningsCount: number
  isLoading: boolean
}

export const TaxCalendarSettingsStatsSection = ({
  yearRange,
  totalEntries,
  warningsCount,
  isLoading,
}: TaxCalendarSettingsStatsSectionProps) => {
  const statCards = [
    {
      key: 'year-range',
      title: 'טווח שנים',
      value: yearRange,
      icon: CalendarDays,
      variant: 'blue' as const,
      description: 'טווח השנים של תקציר יומן המס',
      loading: false,
    },
    {
      key: 'entries',
      title: 'רשומות',
      value: totalEntries,
      icon: ListChecks,
      variant: 'neutral' as const,
      description: 'רשומות יומן המס בטווח שנבחר',
      loading: isLoading,
    },
    {
      key: 'warnings',
      title: 'אזהרות',
      value: warningsCount,
      icon: AlertTriangle,
      variant: warningsCount > 0 ? ('orange' as const) : ('green' as const),
      description: 'פערים שנמצאו בבדיקת היומן',
      loading: isLoading,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {statCards.map((card) => (
        <StatsCard
          key={card.key}
          title={card.title}
          value={card.value}
          icon={card.icon}
          variant={card.variant}
          loading={card.loading}
          description={card.description}
        />
      ))}
    </div>
  )
}

TaxCalendarSettingsStatsSection.displayName = 'TaxCalendarSettingsStatsSection'
