export type SearchItemType =
  | 'binder'
  | 'document'
  | 'vat_work_item'
  | 'annual_report'
  | 'advance_payment'
  | 'charge'
  | 'task'
  | 'notification'

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

interface PaginatedClientMatches {
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
  client_status?: string
  entity_type?: string
  binder_location_status?: string
  binder_capacity_status?: string
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
