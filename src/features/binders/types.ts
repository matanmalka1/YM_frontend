export type BinderLocationStatus = 'in_office' | 'ready_for_handover' | 'handed_over'
export type BinderCapacityStatus = 'open' | 'full'
export type BinderAction =
  | 'receive_material'
  | 'mark_full'
  | 'reopen_capacity'
  | 'mark_ready_for_handover'
  | 'revert_ready_for_handover'
  | 'handover_to_client'

export interface BinderResponse {
  id: number
  client_record_id: number
  office_client_number?: number | null
  client_name: string | null
  client_id_number?: string | null
  binder_number: string
  period_start: string | null
  period_end: string | null
  location_status: BinderLocationStatus
  capacity_status: BinderCapacityStatus
  ready_for_handover_at?: string | null
  handed_over_at: string | null
  handover_recipient_name?: string | null
  notes?: string | null
  days_in_office?: number | null
  available_actions?: BinderAction[] | null
}

export interface BinderListResponse {
  items: BinderResponse[]
  page: number
  page_size: number
  total: number
  counters: BinderListCounters
}

export interface BinderListCounters {
  total: number
  location_in_office: number
  location_ready_for_handover: number
  location_handed_over: number
  capacity_open: number
  capacity_full: number
}

export interface BinderHistoryEntry {
  field_name: 'location_status' | 'capacity_status'
  old_value: string
  new_value: string
  changed_by_user_id: number
  changed_by_name?: string | null
  changed_at: string
  notes?: string | null
}

export interface BinderHistoryResponse {
  binder_id: number
  history: BinderHistoryEntry[]
  total: number
  page: number
  page_size: number
}

export interface ListBindersParams {
  location_status?: string
  capacity_status?: string
  client_record_id?: number
  query?: string
  client_name?: string
  binder_number?: string
  page?: number
  page_size?: number
  sort_by?: string
  order?: string
  year?: number
}

export interface ListOperationalBindersParams {
  page?: number
  page_size?: number
}

export interface ReceiveBinderPayload {
  client_record_id: number
  received_at: string
  received_by: number
  open_new_binder?: boolean
  notes?: string | null
  materials?: {
    material_type: string
    business_id?: number | null
    annual_report_id?: number | null
    vat_report_id?: number | null
    period_year: number
    period_month_start: number
    period_month_end: number
    description?: string | null
  }[]
}

export interface HandoverToClientPayload {
  handover_recipient_name?: string | null
  handed_over_at?: string | null
}

export type BindersFilters = Omit<ListBindersParams, 'client_name' | 'year'> & {
  binder_number?: string
  year?: string
}

export interface BindersFiltersBarProps {
  filters: BindersFilters
  counters: BinderListCounters
  countersLoading?: boolean
  onFilterChange: (name: string, value: string) => void
  onReset: () => void
}

export interface BinderIntakeMaterialResponse {
  id: number
  intake_id: number
  material_type: string
  business_id?: number | null
  annual_report_id?: number | null
  vat_report_id?: number | null
  period_year?: number | null
  period_month_start?: number | null
  period_month_end?: number | null
  description?: string | null
  created_at: string
}

export interface BinderIntakeResponse {
  id: number
  binder_id: number
  received_at: string
  received_by: number
  received_by_name?: string | null
  notes?: string | null
  created_at: string
  materials: BinderIntakeMaterialResponse[]
}

export interface BinderIntakeListResponse {
  binder_id: number
  intakes: BinderIntakeResponse[]
  total: number
  page: number
  page_size: number
}

export interface BinderReceiveResult {
  binder: BinderResponse
  intake: BinderIntakeResponse
  is_new_binder: boolean
}
