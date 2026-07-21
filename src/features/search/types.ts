import type { ClientPickerValue } from '@/components/shared/client'
import type { SearchEnumFilters } from './utils/searchUrlValues'

/**
 * The page's filter state, already parsed out of the URL. The enum-backed fields carry only
 * values the API accepts — an unsupported one from a hand-edited URL or an old bookmark reads
 * as `''` ("all") rather than being passed on.
 */
export interface SearchFilters extends SearchEnumFilters {
  search: string
  client_record_id: string
  binder_number: string
  page: number
  page_size: number
}

/**
 * Paging state for one of the page's two lists — the client matches, or the expanded feed group.
 * The two never appear together, so both drive the same `page` param.
 */
export interface SearchPagination {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

/** A URL-backed text filter typed into an input: local draft value + debounced commit. */
interface SearchTextFilterDraft {
  value: string
  onChange: (value: string) => void
}

export interface SearchFiltersBarProps {
  filters: SearchFilters
  textDrafts: {
    binder_number: SearchTextFilterDraft
  }
  onFilterChange: (name: keyof SearchFilters, value: string) => void
  onReset: () => void
  isOpen: boolean
  onToggle: () => void
}

/**
 * What the advanced panel holds, and what its badge counts. `client_record_id` is not here: it
 * picks a client rather than narrowing the list, so it lives beside the search box, not inside
 * the filters. There is no ID-number filter either — the typed term already matches ID numbers,
 * and a second input over the same column only raised the question of how the two combined.
 */
export const SEARCH_ADVANCED_FILTER_KEYS: (keyof SearchFilters)[] = [
  'binder_number',
  'client_status',
  'entity_type',
  'binder_location_status',
  'binder_capacity_status',
]
