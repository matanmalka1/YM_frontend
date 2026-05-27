import type { SearchParams } from './api'

export interface SearchFilters extends Required<SearchParams> {
  page: number
  page_size: number
}

export interface SearchFiltersBarProps {
  filters: SearchFilters
  onFilterChange: (name: keyof SearchFilters, value: string) => void
  onReset?: () => void
  isOpen: boolean
  onToggle: () => void
}

export const SEARCH_ADVANCED_FILTER_KEYS: (keyof SearchFilters)[] = [
  'client_name',
  'id_number',
  'binder_number',
  'client_status',
  'entity_type',
  'binder_location_status',
  'filename',
]
