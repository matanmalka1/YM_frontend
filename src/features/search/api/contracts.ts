export interface SearchResult {
  result_type: string
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

export interface SearchResponse {
  results: SearchResult[]
  documents: DocumentSearchResult[]
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
  filename?: string
  page?: number
  page_size?: number
}
