import type { RefObject } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { Input } from '@/components/ui/inputs/Input'
import { GLOBAL_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import type { SearchFilters, SearchFiltersBarProps } from '../types'
import { SearchFiltersBar } from './SearchFiltersBar'

interface SearchToolbarProps {
  inputRef: RefObject<HTMLInputElement | null>
  queryDraft: string
  onQueryDraftChange: (value: string) => void
  filters: SearchFilters
  onFilterChange: SearchFiltersBarProps['onFilterChange']
  onReset: () => void
  advancedFiltersOpen: boolean
  onToggleAdvancedFilters: () => void
}

/** One place to type, and the enumerated filters beside it. */
export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  inputRef,
  queryDraft,
  onQueryDraftChange,
  filters,
  onFilterChange,
  onReset,
  advancedFiltersOpen,
  onToggleAdvancedFilters,
}) => (
  <ToolbarContainer>
    <div className="flex flex-wrap items-start gap-2">
      <div className="min-w-[200px] flex-1">
        <Input
          ref={inputRef}
          type="text"
          value={queryDraft}
          onChange={(event) => onQueryDraftChange(event.target.value)}
          placeholder={GLOBAL_SEARCH_PLACEHOLDER}
          startIcon={<SearchIcon className="h-4 w-4" />}
          autoFocus
        />
      </div>
      <SearchFiltersBar
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onReset}
        isOpen={advancedFiltersOpen}
        onToggle={onToggleAdvancedFilters}
      />
    </div>
  </ToolbarContainer>
)

SearchToolbar.displayName = 'SearchToolbar'
