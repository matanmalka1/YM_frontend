import type { BinderCapacityStatus, BinderLocationStatus } from '@/features/binders'
import type { ClientStatus, EntityType } from '@/features/clients'

export type SearchItemType = 'binder' | 'document' | 'vat_work_item' | 'annual_report' | 'advance_payment' | 'charge' | 'task' | 'notification'

export interface SearchClientMatch {
  id: number
  office_client_number?: number | null
  name: string
  id_number?: string | null
  status: string
  matched_binder_numbers: string[]
  href: string
}

export interface SearchItem {
  result_type: SearchItemType
  id: number
  title: string
  detail: string | null
  /** Null for documents, which carry no work status. */
  status: string | null
  amount: string | null
  /** Date the row is anchored to — due date, upload date, issue date. */
  occurred_on: string | null
  href: string
}

interface SearchItemGroup {
  items: SearchItem[]
  total: number
}

export type SearchItemGroupKey =
  | 'binders'
  | 'documents'
  | 'vat_work_items'
  | 'annual_reports'
  | 'advance_payments'
  | 'charges'
  | 'tasks'
  | 'notifications'

export type SearchItemGroups = Record<SearchItemGroupKey, SearchItemGroup>

export interface PaginatedClientMatches {
  items: SearchClientMatch[]
  page: number
  page_size: number
  total: number
}

export interface SearchResponse {
  clients: PaginatedClientMatches
  items: SearchItemGroups
}

export interface SearchParams {
  search?: string
  client_record_id?: number
  id_number?: string
  binder_number?: string
  /** Enum-backed: only values the API accepts reach here — see `utils/searchUrlValues`. */
  client_status?: ClientStatus
  entity_type?: EntityType
  binder_location_status?: BinderLocationStatus
  binder_capacity_status?: BinderCapacityStatus
  page?: number
  page_size?: number
}

export interface SearchItemsParams {
  client_record_id: number
  result_type: SearchItemType
  page?: number
  page_size?: number
}

export interface SearchItemsResponse {
  items: SearchItem[]
  page: number
  page_size: number
  total: number
}
