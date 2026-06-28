import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import type { FilterFieldDef } from '@/components/ui/filters/types'
import { DOCUMENT_TYPE_OPTIONS, SEARCH_PLACEHOLDER, TAX_YEAR_OPTIONS } from '../../constants'
import { DOCUMENTS_MESSAGES } from '../../messages'

const DOCUMENT_FILTER_FIELDS = [
  {
    type: 'search',
    key: 'search',
    label: DOCUMENTS_MESSAGES.list.searchFilterLabel,
    placeholder: SEARCH_PLACEHOLDER,
  },
  {
    type: 'select',
    key: 'filterType',
    label: DOCUMENTS_MESSAGES.list.documentTypeFilterLabel,
    options: DOCUMENT_TYPE_OPTIONS,
  },
  {
    type: 'select',
    key: 'taxYear',
    label: DOCUMENTS_MESSAGES.list.taxYearFilterLabel,
    options: TAX_YEAR_OPTIONS,
  },
] satisfies FilterFieldDef[]

interface DocumentsFilterPanelProps {
  search: string
  onSearchChange: (search: string) => void
  filterType: string
  onFilterTypeChange: (documentType: string) => void
  taxYear: number | null
  onTaxYearChange: (year: number | null) => void
}

export const DocumentsFilterPanel: React.FC<DocumentsFilterPanelProps> = ({
  search,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  taxYear,
  onTaxYearChange,
}) => {
  const resetFilters = () => {
    onSearchChange('')
    onFilterTypeChange('')
    onTaxYearChange(null)
  }

  const handleChange = (key: string, value: string) => {
    if (key === 'search') return onSearchChange(value)
    if (key === 'filterType') return onFilterTypeChange(value)
    if (key === 'taxYear') return onTaxYearChange(value ? Number(value) : null)
  }

  return (
    <FilterPanel
      fields={DOCUMENT_FILTER_FIELDS}
      values={{ search, filterType, taxYear: taxYear?.toString() ?? '' }}
      onChange={handleChange}
      onReset={resetFilters}
      title={DOCUMENTS_MESSAGES.list.filterTitle}
      subtitle={DOCUMENTS_MESSAGES.list.filterSubtitle}
    />
  )
}

DocumentsFilterPanel.displayName = 'DocumentsFilterPanel'
