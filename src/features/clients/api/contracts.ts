import type { BackendAction } from '@/lib/actions/types'
import type { ISODateString, PaginatedResponse } from '@/types'

export interface ClientRecordResponse {
  id: number
  full_name: string
  id_number: string
  id_number_type: 'individual' | 'corporation' | 'passport' | 'other' | null
  entity_type: EntityType | null
  status: ClientStatus
  phone: string | null
  email: string | null
  notes: string | null
  address_street: string | null
  address_building_number: string | null
  address_apartment: string | null
  address_city: string | null
  address_zip_code: string | null
  office_client_number: number | null
  vat_reporting_frequency: VatType | null
  advance_payment_frequency: AdvancePaymentFrequency | null
  vat_exempt_ceiling: string | null
  advance_rate: string | null
  advance_rate_updated_at: string | null
  annual_revenue: string | null
  accountant_id: number | null
  created_at: string | null
  updated_at: string | null
  created_by: number | null
  active_binder_number: string | null
  annual_turnover: AnnualTurnover | null
}

export interface AnnualTurnover {
  amount: string | null
  source: 'reported' | 'manual' | 'none'
  year: number
}

export interface ActiveClientSummary {
  id: number
  full_name: string
  id_number: string
}

export interface DeletedClientSummary {
  id: number
  full_name: string
  id_number: string
  deleted_at: string
}

export interface ClientConflictInfo {
  id_number: string
  active_clients: ActiveClientSummary[]
  deleted_clients: DeletedClientSummary[]
}

// Thin DTO for the clients list/table rows. Mirrors backend ClientRecordListItem.
// Detail/profile fields live on ClientRecordResponse (GET /clients/{id}).
export interface ClientRecordListItem {
  id: number
  full_name: string
  id_number: string
  entity_type: EntityType | null
  status: ClientStatus
  office_client_number: number | null
  phone: string | null
  email: string | null
  created_at: string | null
  active_binder_number: string | null
}

export interface ClientRecordListStats {
  active: number
  frozen: number
  closed: number
}

export type ClientRecordListResponse = PaginatedResponse<ClientRecordListItem> & { stats: ClientRecordListStats }

export interface ClientSidebarResponse {
  id: number
  full_name: string
  office_client_number: number | null
  phone: string | null
  email: string | null
  entity_type: EntityType | null
  vat_reporting_frequency: VatType | null
}

export type ClientSidebarListResponse = PaginatedResponse<ClientSidebarResponse>

export interface ListClientsParams {
  search?: string
  status?: ClientStatus
  entity_type?: EntityType
  accountant_id?: number
  sort_by?: 'full_name' | 'created_at' | 'status' | 'entity_type'
  order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export interface ListClientSidebarParams {
  search?: string
  sort_by?: 'full_name' | 'office_client_number'
  order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export interface CreateClientPayload {
  full_name: string
  id_number: string
  id_number_type?: 'individual' | 'corporation' | 'passport' | 'other'
  entity_type: EntityType
  phone: string
  email: string
  address_street: string
  address_building_number: string
  address_apartment?: string | null
  address_city: string
  address_zip_code?: string | null
  vat_reporting_frequency?: VatType | null
  advance_payment_frequency?: AdvancePaymentFrequency | null
  advance_rate?: string | null
  advance_rate_updated_at?: string | null
  accountant_id?: number | null
  business_name: string
  business_opened_at?: ISODateString | null
}

export interface ClientImpactPreviewPayload {
  entity_type: EntityType
  vat_reporting_frequency?: VatType | null
  advance_payment_frequency?: AdvancePaymentFrequency | null
  advance_rate?: string | null
}

export interface CreationImpactItem {
  label: string
  count: number
}

export interface ClientCreationImpactResponse {
  items: CreationImpactItem[]
  years_scope: number
  note: string | null
  vat_exempt_ceiling: string | null
}

export interface CreateClientRecordResponse {
  client_record_id: number
  client: ClientRecordResponse
  business: BusinessResponse
  impact: ClientCreationImpactResponse
}

export type BulkClientActionPayload = never
export type DeletedClientInfo = DeletedClientSummary

export interface UpdateClientPayload {
  full_name?: string
  status?: ClientStatus
  phone?: string | null
  email?: string | null
  address_street?: string | null
  address_building_number?: string | null
  address_apartment?: string | null
  address_city?: string | null
  address_zip_code?: string | null
  entity_type?: EntityType | null
  vat_reporting_frequency?: VatType | null
  advance_payment_frequency?: AdvancePaymentFrequency | null
  advance_rate?: string | null
  annual_revenue?: string | null
  accountant_id?: number | null
}

export type EntityType = 'osek_patur' | 'osek_murshe' | 'company_ltd' | 'employee'
export type BusinessStatus = 'active' | 'frozen' | 'closed'
export type ClientStatus = 'active' | 'frozen' | 'closed'
export type VatType = 'monthly' | 'bimonthly' | 'exempt'
export type AdvancePaymentFrequency = 'monthly' | 'bimonthly'

export interface BusinessResponse {
  id: number
  client_id: number
  business_name: string | null
  status: BusinessStatus
  opened_at: ISODateString
  closed_at: string | null
  notes: string | null
  created_at: string | null
  available_actions?: BackendAction[] | null
}

export interface BusinessWithClientResponse extends BusinessResponse {
  client_full_name: string
  client_id_number: string
}

export type BusinessListResponse = PaginatedResponse<BusinessWithClientResponse>
export type ClientBusinessesResponse = {
  client_id: number
  items: BusinessResponse[]
  page: number
  page_size: number
  total: number
}

export interface ListBusinessesParams {
  status?: BusinessStatus
  has_signals?: boolean
  search?: string
  page?: number
  page_size?: number
}

export interface CreateBusinessPayload {
  opened_at?: ISODateString | null
  business_name: string
  notes?: string | null
}

export interface UpdateBusinessPayload {
  business_name?: string | null
  status?: BusinessStatus
  closed_at?: string | null
}

export interface VatSummaryCard {
  net_vat_total: string
  periods_filed: number
  periods_total: number
  latest_period: string | null
}

export interface AnnualReportCard {
  status: string | null
  form_type: string | null
  filing_deadline: string | null
  refund_due: string | null
  tax_due: string | null
}

export interface ChargesCard {
  total_outstanding: string
  unpaid_count: number
}

export interface AdvancePaymentsCard {
  total_paid: string
  count: number
}

export interface BindersCard {
  active_count: number
  in_office_count: number
}

export interface DocumentsCard {
  total_count: number
  present_count: number
}

export interface BusinessStatusCardResponse {
  client_id: number
  year: number
  client_vat: VatSummaryCard // shared across all businesses of this client
  annual_report: AnnualReportCard
  charges: ChargesCard
  advance_payments: AdvancePaymentsCard
  binders: BindersCard
  documents: DocumentsCard
}

export interface ClientScopedSignatureBusinessRef {
  client_id: number | null
  business_name: string | null
}
