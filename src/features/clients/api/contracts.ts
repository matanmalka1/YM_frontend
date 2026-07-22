import type { ISODateString, PaginatedResponse } from '@/types'
import type { VatReportingFrequency } from '@/types/vatReporting'

type VatType = VatReportingFrequency

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

interface AnnualTurnover {
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

interface ClientRecordListStats {
  osek_patur: number
  osek_murshe: number
  company_ltd: number
  employee: number
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

interface CreationImpactItem {
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
export type AdvancePaymentFrequency = 'monthly' | 'bimonthly'

export interface BusinessResponse {
  id: number
  client_id: number | null
  business_name: string | null
  status: BusinessStatus
  opened_at: ISODateString
  closed_at: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export type ClientBusinessesResponse = {
  client_id: number
  items: BusinessResponse[]
  page: number
  page_size: number
  total: number
}

export interface ListClientBusinessesParams {
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

interface VatSummaryCard {
  net_vat_total: string
  periods_filed: number
  periods_total: number
  latest_period: string | null
}

interface AnnualReportCard {
  status: string | null
  form_type: string | null
  filing_deadline: string | null
  refund_due: string | null
  tax_due: string | null
}

interface ChargesCard {
  total_outstanding: string
  unpaid_count: number
}

interface AdvancePaymentsCard {
  total_paid: string
  count: number
}

interface BindersCard {
  active_count: number
  in_office_count: number
}

interface DocumentsCard {
  total_count: number
  present_count: number
}

interface TasksCard {
  open_count: number
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
  tasks: TasksCard
}
