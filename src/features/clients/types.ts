import type { ClientStatus, EntityType, ListClientsParams } from './api'
import type { ClientSortBy, ClientSortOrder } from './constants'

export interface ClientsFilters extends ListClientsParams {
  search: string
  status?: ClientStatus
  entity_type?: EntityType
  sort_by: ClientSortBy
  order: ClientSortOrder
}
