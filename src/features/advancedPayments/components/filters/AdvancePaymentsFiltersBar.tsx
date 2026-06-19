import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { ADVANCE_PAYMENTS_FILTER_FIELDS } from '../../constants'

interface AdvancePaymentsFiltersBarProps {
  values: Readonly<Record<string, string | undefined>>
  onChange: (key: string, value: string) => void
  onMultiChange: (updates: Record<string, string>) => void
  onReset: () => void
}

export const AdvancePaymentsFiltersBar = ({
  values,
  onChange,
  onMultiChange,
  onReset,
}: AdvancePaymentsFiltersBarProps) => (
  <FilterPanel
    fields={ADVANCE_PAYMENTS_FILTER_FIELDS}
    values={values}
    onChange={onChange}
    onMultiChange={onMultiChange}
    onReset={onReset}
    gridClass="grid-cols-1 sm:grid-cols-4"
  />
)

AdvancePaymentsFiltersBar.displayName = 'AdvancePaymentsFiltersBar'
