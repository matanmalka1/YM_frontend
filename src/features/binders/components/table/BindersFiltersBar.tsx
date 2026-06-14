import { useMemo } from 'react'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { Archive, CheckCircle2, FolderKanban, Undo2 } from 'lucide-react'
import { BINDER_CAPACITY_STATUS_OPTIONS, BINDER_LOCATION_STATUS_OPTIONS } from '../../constants'
import type { BindersFiltersBarProps } from '../../types'
import { getOperationalYearOptions } from '@/constants/periodOptions.constants'

const getFields = () => [
  {
    type: 'client-picker' as const,
    idKey: 'client_record_id',
    nameKey: 'client_name',
    label: 'לקוח',
    placeholder: 'חיפוש לקוח...',
  },
  {
    type: 'search' as const,
    key: 'binder_number',
    label: 'מספר קלסר',
    placeholder: 'חיפוש לפי מספר קלסר...',
  },
  { type: 'select' as const, key: 'location_status', label: 'מיקום', options: BINDER_LOCATION_STATUS_OPTIONS },
  { type: 'select' as const, key: 'capacity_status', label: 'קיבולת', options: BINDER_CAPACITY_STATUS_OPTIONS },
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
  onMultiFilterChange,
  onReset,
}: BindersFiltersBarProps) => {
  const fields = useMemo(() => getFields(), [])

  const handleFilterChange = (key: string, value: string) => {
    if ((key === 'client_record_id' || key === 'client_name') && !value) {
      onMultiFilterChange({ client_record_id: '', client_name: '' })
      return
    }
    onFilterChange(key, value)
  }

  const handleMultiFilterChange = (updates: Record<string, string>) => {
    onMultiFilterChange({
      client_record_id: updates.client_record_id,
      client_name: updates.client_name,
      location_status: updates.location_status,
      capacity_status: updates.capacity_status,
      binder_number: updates.binder_number,
      year: updates.year,
      page: updates.page,
    })
  }

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
      fields={fields}
      values={{
        client_record_id: filters.client_record_id ? String(filters.client_record_id) : '',
        client_name: filters.client_name ?? '',
        binder_number: filters.binder_number ?? '',
        location_status: filters.location_status ?? '',
        capacity_status: filters.capacity_status ?? '',
        year: filters.year ?? '',
      }}
      onChange={handleFilterChange}
      onMultiChange={handleMultiFilterChange}
      onReset={onReset}
      gridClass="grid-cols-1 sm:grid-cols-2 xl:grid-cols-5"
      above={pills}
    />
  )
}

BindersFiltersBar.displayName = 'BindersFiltersBar'
