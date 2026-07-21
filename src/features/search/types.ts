import type { SearchEnumFilters } from './utils/searchUrlValues'

/**
 * The page's filter state, already parsed out of the URL. The enum-backed fields carry only
 * values the API accepts — an unsupported one from a hand-edited URL or an old bookmark reads
 * as `''` ("all") rather than being passed on.
 */
export interface SearchFilters extends SearchEnumFilters {
  search: string
  client_record_id: string
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

export interface SearchFiltersBarProps {
  filters: SearchFilters
  onFilterChange: (name: keyof SearchFilters, value: string) => void
  onReset: () => void
  isOpen: boolean
  onToggle: () => void
}

/**
 * What the advanced panel holds, and what its badge counts — enumerated values only.
 *
 * There is exactly one place to type on this page. Identifiers the term already matches (ID
 * number, binder number) had inputs of their own, which only raised the question of how they
 * combined with the term, and `client_record_id` had a picker, which was a second client search
 * beside the one the page is. Selection happens by choosing a match; typing happens once.
 */
export const SEARCH_ADVANCED_FILTER_KEYS: (keyof SearchFilters)[] = [
  'client_status',
  'entity_type',
  'binder_location_status',
  'binder_capacity_status',
]
