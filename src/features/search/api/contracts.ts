export interface SearchResult {
  result_type: 'client' | 'binder'
  client_record_id: number
  office_client_number?: number | null
  client_name: string
  id_number?: string | null
  client_status?: string | null
  binder_id: number | null
  binder_number: string | null
}

export interface DocumentSearchResult {
  id: number
  client_record_id: number
  office_client_number?: number | null
  business_id?: number | null
  business_name?: string | null
  client_name: string
  document_type: string
  original_filename: string | null
  tax_year: number | null
}

export type OperationalSearchResultType = 'task' | 'vat_work_item' | 'annual_report' | 'charge' | 'advance_payment'

export interface OperationalSearchItem {
  result_type: OperationalSearchResultType
  id: number
  client_record_id: number
  office_client_number: number
  client_name: string
  title: string
  detail: string | null
  status: string
  amount: string | null
  href: string
}

export interface OperationalSearchGroup {
  items: OperationalSearchItem[]
  total: number
}

export interface OperationalSearchResults {
  tasks: OperationalSearchGroup
  vat_work_items: OperationalSearchGroup
  annual_reports: OperationalSearchGroup
  charges: OperationalSearchGroup
  advance_payments: OperationalSearchGroup
}

export interface SearchResponse {
  results: SearchResult[]
  documents: DocumentSearchResult[]
  operational: OperationalSearchResults
  page: number
  page_size: number
  total: number
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
  filename?: string
  page?: number
  page_size?: number
}
