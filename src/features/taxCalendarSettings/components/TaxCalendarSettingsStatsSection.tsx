import { AlertTriangle, CalendarDays, ListChecks } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { TAX_CALENDAR_SETTINGS_MESSAGES } from '../messages'

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
      title: TAX_CALENDAR_SETTINGS_MESSAGES.stats.yearRangeTitle,
      value: yearRange,
      icon: CalendarDays,
      variant: 'info' as const,
      description: TAX_CALENDAR_SETTINGS_MESSAGES.stats.yearRangeDescription,
      loading: false,
    },
    {
      key: 'entries',
      title: TAX_CALENDAR_SETTINGS_MESSAGES.stats.entriesTitle,
      value: totalEntries,
      icon: ListChecks,
      variant: 'neutral' as const,
      description: TAX_CALENDAR_SETTINGS_MESSAGES.stats.entriesDescription,
      loading: isLoading,
    },
    {
      key: 'warnings',
      title: TAX_CALENDAR_SETTINGS_MESSAGES.stats.warningsTitle,
      value: warningsCount,
      icon: AlertTriangle,
      variant: warningsCount > 0 ? ('warning' as const) : ('positive' as const),
      description: TAX_CALENDAR_SETTINGS_MESSAGES.stats.warningsDescription,
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
