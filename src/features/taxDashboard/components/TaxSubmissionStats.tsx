import { StatsCard } from '@/components/ui/layout/StatsCard'
import type { TaxSubmissionWidgetResponse } from '../api'
import { buildTaxSubmissionStats, getNextTaxSubmissionFilter } from '../helpers'

interface TaxSubmissionStatsProps {
  data?: TaxSubmissionWidgetResponse
  activeFilter?: string
  onFilter?: (status: string) => void
}

export const TaxSubmissionStats = ({ data, activeFilter, onFilter }: TaxSubmissionStatsProps) => {
  if (!data) return null

  const stats = buildTaxSubmissionStats(data)

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map(({ key, title, value, icon, variant, filterValue }) => {
        const isFilterable = filterValue !== undefined
        const isSelected = isFilterable && activeFilter === filterValue

        return (
          <StatsCard
            key={key}
            title={title}
            value={value}
            icon={icon}
            variant={variant}
            onClick={isFilterable && onFilter ? () => onFilter(getNextTaxSubmissionFilter(activeFilter, filterValue)) : undefined}
            selected={isSelected}
          />
        )
      })}
    </div>
  )
}

TaxSubmissionStats.displayName = 'TaxSubmissionStats'
