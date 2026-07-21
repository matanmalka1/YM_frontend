import type { ClientPickerValue } from '@/components/shared/client'

export interface SearchFilters {
  search: string
  client_record_id: string
  id_number: string
  binder_number: string
  client_status: string
  entity_type: string
  binder_location_status: string
  binder_capacity_status: string
  page: number
  page_size: number
}

/** A URL-backed text filter typed into an input: local draft value + debounced commit. */
interface SearchTextFilterDraft {
  value: string
  onChange: (value: string) => void
}

export interface SearchFiltersBarProps {
  filters: SearchFilters
  textDrafts: {
    id_number: SearchTextFilterDraft
    binder_number: SearchTextFilterDraft
  }
  hydratedClient: ClientPickerValue | null
  onFilterChange: (name: keyof SearchFilters, value: string) => void
  onReset: () => void
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
  'binder_capacity_status',
]
