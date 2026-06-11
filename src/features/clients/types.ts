import type { ClientStatus, EntityType, ListClientsParams } from './api'
import type { ClientSortBy, ClientSortOrder } from './constants'

export interface ClientsFilters extends ListClientsParams {
  search: string
  status?: ClientStatus
  entity_type?: EntityType
  sort_by: ClientSortBy
  order: ClientSortOrder
}

export interface ClientsFiltersBarProps {
  filters: ClientsFilters
  onFilterChange: (
    name: 'accountant_id' | 'entity_type' | 'page_size' | 'search' | 'status' | 'sort_by' | 'order',
    value: string,
  ) => void
  onReset: () => void
  showAccountantFilter?: boolean
}
