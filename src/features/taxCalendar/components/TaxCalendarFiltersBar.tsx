import { Button } from '@/components/ui/primitives/Button'
import { Checkbox } from '@/components/ui/primitives/Checkbox'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { TAX_CALENDAR_OBLIGATION_TYPE_OPTIONS, TAX_CALENDAR_STATUS_OPTIONS } from '../constants'
import type { TaxCalendarGroupStatusFilter } from '../utils'

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
  const showClientSearch = clientSearchText != null && onClientSearchTextChange
  const showIncludeEmpty = includeEmpty != null && onIncludeEmptyChange
  const gridColumns = showClientSearch && showIncludeEmpty ? 'lg:grid-cols-7' : showClientSearch || showIncludeEmpty ? 'lg:grid-cols-6' : 'lg:grid-cols-5'

  return (
    <ToolbarContainer>
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${gridColumns}`}>
        <Input
          type="number"
          label="משנת מס"
          min={2000}
          max={2100}
          value={startYear}
          onChange={(event) => onStartYearChange(event.target.value)}
        />
        <Input
          type="number"
          label="עד שנת מס"
          min={2000}
          max={2100}
          value={endYear}
          onChange={(event) => onEndYearChange(event.target.value)}
        />
        <Select
          label="סוג חובה"
          value={obligationType}
          onChange={(event) => onObligationTypeChange(event.target.value)}
          options={TAX_CALENDAR_OBLIGATION_TYPE_OPTIONS}
        />
        <Select
          label="מצב"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as TaxCalendarGroupStatusFilter)}
          options={TAX_CALENDAR_STATUS_OPTIONS}
        />
        {showClientSearch ? (
          <Input
            label="חיפוש לקוח"
            value={clientSearchText}
            onChange={(event) => onClientSearchTextChange(event.target.value)}
            placeholder="שם או מספר לקוח"
          />
        ) : null}
        {showIncludeEmpty ? (
          <div className="flex items-end">
            <Checkbox
              checked={includeEmpty}
              onChange={(event) => onIncludeEmptyChange(event.target.checked)}
              label="כולל ריקים"
              description="הצג חובות ללא תיקים מקושרים"
              containerClassName="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
            />
          </div>
        ) : null}
        <div className="flex items-end">
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            איפוס סינון
          </Button>
        </div>
      </div>
    </ToolbarContainer>
  )
}

TaxCalendarFiltersBar.displayName = 'TaxCalendarFiltersBar'
