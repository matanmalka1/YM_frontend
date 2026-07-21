/**
 * Entity types that appear as match rows. Deliberately excludes `client` — a client is a
 * resolution result, not a record row, and `result_type=client` is a 422 on `/search/items`.
 */
export type SearchMatchType =
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

/**
 * One record the typed term matched. A match row is meaningless without its client, so every
 * row carries its owning client's identity.
 */
export interface SearchMatch {
  result_type: SearchMatchType
  id: number
  title: string
  detail: string | null
  /** Null for documents, which carry no work status. */
  status: string | null
  amount: string | null
  /** Date the row is anchored to — due date, upload date, issue date. */
  occurred_on: string | null
  href: string
  client_record_id: number
  client_name: string
  client_office_number: number | null
}

/** Up to five preview rows for one type plus the exact total behind them. */
export interface SearchMatchGroup {
  items: SearchMatch[]
  total: number
}

export type SearchMatchGroupKey =
  | 'binders'
  | 'documents'
  | 'vat_work_items'
  | 'annual_reports'
  | 'advance_payments'
  | 'charges'
  | 'tasks'
  | 'notifications'

export type SearchMatchGroups = Record<SearchMatchGroupKey, SearchMatchGroup>

export interface PaginatedClientMatches {
  items: SearchClientMatch[]
  page: number
  page_size: number
  total: number
}

export interface SearchResponse {
  clients: PaginatedClientMatches
  matches: SearchMatchGroups
}

/** `page`/`page_size` page the clients list; the match previews are fixed-size. */
export interface SearchParams {
  search: string
  page?: number
  page_size?: number
}

export interface SearchMatchesParams {
  search: string
  result_type: SearchMatchType
  page?: number
  page_size?: number
}

export interface SearchMatchesResponse {
  items: SearchMatch[]
  page: number
  page_size: number
  total: number
}
