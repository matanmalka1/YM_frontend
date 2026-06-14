export interface SearchFilters {
  search: string
  client_record_id: string
  id_number: string
  binder_number: string
  client_status: string
  entity_type: string
  binder_location_status: string
  filename: string
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
  'client_record_id',
  'id_number',
  'binder_number',
  'client_status',
  'entity_type',
  'binder_location_status',
  'filename',
]
