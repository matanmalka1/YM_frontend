import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { Archive, CheckCircle2, FolderKanban, Undo2 } from 'lucide-react'
import { BINDER_LOCATION_STATUS_OPTIONS } from '../../constants'
import type { BindersFiltersBarProps } from '../../types'
import { getOperationalYearOptions } from '@/constants/periodOptions.constants'

const getFields = () => [
  { type: 'search' as const, key: 'query', label: 'חיפוש', placeholder: 'שם לקוח...' },
  {
    type: 'search' as const,
    key: 'binder_number',
    label: 'מספר קלסר',
    placeholder: 'מספר קלסר מדויק...',
  },
  { type: 'select' as const, key: 'location_status', label: 'מיקום', options: BINDER_LOCATION_STATUS_OPTIONS },
  {
    type: 'select' as const,
    key: 'year',
    label: 'שנה',
    options: [{ value: '', label: 'כל התקופות' }, ...getOperationalYearOptions()],
  },
]

export const BindersFiltersBar = ({
  filters,
  counters,
  countersLoading = false,
  onFilterChange,
  onReset,
}: BindersFiltersBarProps) => {
  const statusPills = [
    {
      key: '',
      label: 'סה"כ קלסרים',
      count: counters.total,
      icon: FolderKanban,
      variant: 'blue' as const,
    },
    {
      key: 'in_office',
      label: 'במשרד',
      count: counters.location_in_office,
      icon: Archive,
      variant: 'orange' as const,
    },
    {
      key: 'ready_for_handover',
      label: 'מוכן למסירה',
      count: counters.location_ready_for_handover,
      icon: CheckCircle2,
      variant: 'green' as const,
    },
    {
      key: 'handed_over',
      label: 'נמסר ללקוח',
      count: counters.location_handed_over,
      icon: Undo2,
      variant: 'neutral' as const,
    },
  ] as const

  const pills = (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {statusPills.map((pill) => (
        <StatsCard
          key={pill.key || 'total'}
          title={pill.label}
          value={countersLoading ? '...' : pill.count}
          icon={pill.icon}
          variant={pill.variant}
          onClick={() => onFilterChange('location_status', pill.key)}
          selected={(filters.location_status ?? '') === pill.key}
          className="h-full w-full text-right"
        />
      ))}
    </div>
  )

  return (
    <FilterPanel
      fields={getFields()}
      values={{
        query: filters.query ?? '',
        binder_number: filters.binder_number ?? '',
        location_status: filters.location_status ?? '',
        year: filters.year ?? '',
      }}
      onChange={onFilterChange}
      onReset={onReset}
      gridClass="grid-cols-1 sm:grid-cols-4"
      above={pills}
    />
  )
}

BindersFiltersBar.displayName = 'BindersFiltersBar'
