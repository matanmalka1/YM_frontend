import { Search } from 'lucide-react'
import { ActiveFilterBadges } from '../../../../components/ui/table/ActiveFilterBadges'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import { DOCUMENT_TYPE_OPTIONS, SEARCH_PLACEHOLDER, TAX_YEAR_OPTIONS } from '../../constants'
import { getDocumentFilterBadges } from '../../utils/documentsDataCardsUtils'

interface DocumentsDataCardsToolbarProps {
  search: string
  onSearchChange: (search: string) => void
  filterType: string
  onFilterTypeChange: (documentType: string) => void
  taxYear: number | null
  onTaxYearChange: (year: number | null) => void
}

export const DocumentsDataCardsToolbar: React.FC<DocumentsDataCardsToolbarProps> = ({
  search,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  taxYear,
  onTaxYearChange,
}) => {
  const activeFilterBadges = getDocumentFilterBadges({
    search,
    filterType,
    taxYear,
    onSearchChange,
    onFilterTypeChange,
    onTaxYearChange,
  })
  const resetFilters = () => {
    onSearchChange('')
    onFilterTypeChange('')
    onTaxYearChange(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={SEARCH_PLACEHOLDER}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          startIcon={<Search className="h-3.5 w-3.5" />}
          className="h-8 w-56 text-sm"
        />
        <Select
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
          options={DOCUMENT_TYPE_OPTIONS}
        />
        <Select
          value={taxYear ?? ''}
          onChange={(e) => onTaxYearChange(e.target.value ? Number(e.target.value) : null)}
          options={TAX_YEAR_OPTIONS}
        />
      </div>
      <ActiveFilterBadges badges={activeFilterBadges} onReset={resetFilters} />
    </div>
  )
}
