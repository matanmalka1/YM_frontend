import { useMemo } from 'react'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
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
    />
  )
}
