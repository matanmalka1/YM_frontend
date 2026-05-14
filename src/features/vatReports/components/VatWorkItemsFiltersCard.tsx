import { useMemo } from 'react'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { VAT_PERIOD_TYPE_SELECT_OPTIONS, VAT_WORK_ITEMS_STATUS_OPTIONS } from '../constants'
import type { VatWorkItemsFiltersCardProps } from '../types'
import { getOperationalTaxYear, getOperationalYearOptions } from '@/constants/periodOptions.constants'

export const VatWorkItemsFiltersCard = ({
  filters,
  onClear,
  onFilterChange,
  onMultiFilterChange,
}: VatWorkItemsFiltersCardProps) => {
  const fields = useMemo(() => {
    const yearOptions = [{ value: 'all', label: 'כל השנים' }, ...getOperationalYearOptions()]
    const defaultYear = String(getOperationalTaxYear())
    return [
      { type: 'client-picker' as const, idKey: 'clientSearch', nameKey: 'clientSearchName' },
      {
        type: 'select' as const,
        key: 'year',
        label: 'שנה',
        options: yearOptions,
        defaultValue: defaultYear,
      },
      {
        type: 'select' as const,
        key: 'status',
        label: 'סטטוס',
        options: VAT_WORK_ITEMS_STATUS_OPTIONS,
      },
      {
        type: 'select' as const,
        key: 'period_type',
        label: 'סוג דיווח',
        options: VAT_PERIOD_TYPE_SELECT_OPTIONS,
      },
    ]
  }, [])

  return (
    <FilterPanel
      fields={fields}
      values={{
        clientSearch: filters.clientSearch ?? '',
        clientSearchName: filters.clientSearchName ?? '',
        year: filters.year || 'all',
        status: filters.status ?? '',
        period_type: filters.period_type ?? '',
      }}
      onChange={onFilterChange}
      onMultiChange={onMultiFilterChange}
      onReset={onClear}
      gridClass="grid-cols-1 sm:grid-cols-4"
    />
  )
}

VatWorkItemsFiltersCard.displayName = 'VatWorkItemsFiltersCard'
