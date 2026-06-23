import { useMemo } from 'react'
import { Checkbox } from '@/components/ui/primitives/Checkbox'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { getOperationalYearOptions } from '@/constants/periodOptions.constants'
import {
  TAX_CALENDAR_OBLIGATION_TYPE_OPTIONS,
  TAX_CALENDAR_STATUS_OPTIONS,
  type TaxCalendarGroupStatusFilter,
} from '../../constants'
import { taxCalendarCurrentYear } from '../../utils'
import { CLIENT_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'

interface TaxCalendarFiltersBarProps {
  startYear: string
  endYear: string
  obligationType: string
  status: TaxCalendarGroupStatusFilter
  onStartYearChange: (value: string) => void
  onEndYearChange: (value: string) => void
  onObligationTypeChange: (value: string) => void
  onStatusChange: (value: TaxCalendarGroupStatusFilter) => void
  onReset: () => void
  clientSearchText?: string
  includeEmpty?: boolean
  onClientSearchTextChange?: (value: string) => void
  onIncludeEmptyChange?: (value: boolean) => void
}

export const TaxCalendarFiltersBar = ({
  startYear,
  endYear,
  obligationType,
  status,
  onStartYearChange,
  onEndYearChange,
  onObligationTypeChange,
  onStatusChange,
  onReset,
  clientSearchText,
  includeEmpty,
  onClientSearchTextChange,
  onIncludeEmptyChange,
}: TaxCalendarFiltersBarProps) => {
  const yearOptions = useMemo(() => getOperationalYearOptions(), [])
  const defaultYear = String(taxCalendarCurrentYear())
  const showClientSearch = clientSearchText != null && onClientSearchTextChange
  const showIncludeEmpty = includeEmpty != null && onIncludeEmptyChange

  const fields = useMemo(
    () => [
      { type: 'select' as const, key: 'startYear', label: 'משנת מס', options: yearOptions, defaultValue: defaultYear },
      { type: 'select' as const, key: 'endYear', label: 'עד שנת מס', options: yearOptions, defaultValue: defaultYear },
      {
        type: 'select' as const,
        key: 'obligationType',
        label: 'סוג חובה',
        options: TAX_CALENDAR_OBLIGATION_TYPE_OPTIONS,
      },
      {
        type: 'select' as const,
        key: 'status',
        label: 'מצב',
        options: TAX_CALENDAR_STATUS_OPTIONS,
        defaultValue: 'all',
      },
      ...(showClientSearch
        ? [
            {
              type: 'search' as const,
              key: 'clientSearchText',
              label: 'חיפוש לקוח',
              placeholder: CLIENT_SEARCH_PLACEHOLDER,
            },
          ]
        : []),
    ],
    [yearOptions, defaultYear, showClientSearch],
  )

  const values = {
    startYear,
    endYear,
    obligationType,
    status,
    clientSearchText: clientSearchText ?? '',
  }

  const handleChange = (key: string, value: string) => {
    if (key === 'startYear') return onStartYearChange(value)
    if (key === 'endYear') return onEndYearChange(value)
    if (key === 'obligationType') return onObligationTypeChange(value)
    if (key === 'status') return onStatusChange(value as TaxCalendarGroupStatusFilter)
    if (key === 'clientSearchText') return onClientSearchTextChange?.(value)
  }

  return (
    <div className="space-y-3">
      <FilterPanel
        fields={fields}
        values={values}
        onChange={handleChange}
        onReset={onReset}
        title="סינון לוח מס"
        subtitle="טווח שנים, סוג חובה, מצב וחיפוש"
      />
      {showIncludeEmpty ? (
        <Checkbox
          checked={includeEmpty}
          onChange={(event) => onIncludeEmptyChange(event.target.checked)}
          label="כולל ריקים"
          description="הצג חובות ללא תיקים מקושרים"
        />
      ) : null}
    </div>
  )
}

TaxCalendarFiltersBar.displayName = 'TaxCalendarFiltersBar'
