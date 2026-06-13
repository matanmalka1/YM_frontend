import type { BackendAction } from '@/lib/actions/types'
import type { VatPeriodTypeFilter } from '../constants'

export type VatType = 'monthly' | 'bimonthly' | 'exempt'

export type VatWorkItemStatus =
  | 'pending_materials'
  | 'material_received'
  | 'data_entry_in_progress'
  | 'ready_for_review'
  | 'filed'
  | 'canceled'

export interface VatWorkItemResponse {
  id: number
  client_record_id: number
  office_client_number?: number | null
  client_name: string | null
  client_id_number?: string | null
  client_status: string | null
  period: string
  period_type: VatType
  status: VatWorkItemStatus
  pending_materials_note: string | null
  total_output_vat: string
  total_input_vat: string
  net_vat: string
  total_output_net: string
  total_input_net: string
  final_vat_amount: string | null
  is_overridden: boolean
  override_justification: string | null
  submission_method: string | null
  filed_at: string | null
  filed_by: number | null
  filed_by_name?: string | null
  created_by: number
  assigned_to: number | null
  assigned_to_name?: string | null
  created_at: string
  updated_at: string
  submission_reference: string | null
  is_amendment: boolean
  amends_item_id: number | null
  submission_deadline: string | null
  statutory_deadline: string | null
  extended_deadline: string | null
  days_until_deadline: number | null
  is_overdue: boolean | null
  available_actions?: BackendAction[]
}

// Thin DTO for VAT work-item list/table rows. Mirrors backend VatWorkItemListItem.
// Detail-only fields live on VatWorkItemResponse (GET /vat/work-items/{id}).
export interface VatWorkItemListItem {
  id: number
  client_record_id: number
  office_client_number?: number | null
  client_name: string | null
  client_id_number?: string | null
  period: string
  period_type: VatType
  status: VatWorkItemStatus
  net_vat: string
  final_vat_amount: string | null
  is_overridden: boolean
  filed_at: string | null
  updated_at: string
  submission_deadline: string | null
  extended_deadline: string | null
  days_until_deadline: number | null
  is_overdue: boolean | null
  available_actions?: BackendAction[]
}

export interface VatWorkItemListResponse {
  items: VatWorkItemListItem[]
  total: number
  page: number
  page_size: number
}

export interface VatWorkItemsListParams {
  status?: VatWorkItemStatus
  page?: number
  page_size?: number
  period?: string
  period_type?: VatPeriodTypeFilter
  client_name?: string
}

export interface VatClientWorkItemsParams {
  page?: number
  page_size?: number
  year?: number | null
  period?: string | null
  status?: VatWorkItemStatus | null
  assigned_to?: number | null
  due_after?: string | null
  due_before?: string | null
}

export interface VatWorkItemStatusSummaryParams {
  year?: number
  period_type?: VatPeriodTypeFilter
  client_name?: string
}

export type VatWorkItemStatusSummaryResponse = Record<VatWorkItemStatus, number>

export interface VatWorkItemLookupResponse {
  id: number
  status: VatWorkItemStatus
  period: string
}

interface VatPeriodOptionResponse {
  period: string
  label: string
  start_month: number
  end_month: number
  is_opened: boolean
}

export interface VatPeriodOptionsResponse {
  client_record_id: number
  year: number
  period_type: VatType
  options: VatPeriodOptionResponse[]
}

export interface CreateVatWorkItemPayload {
  client_record_id: number
  period: string
  assigned_to?: number | null
  mark_pending?: boolean
  pending_materials_note?: string | null
}

export interface VatInvoiceResponse {
  id: number
  work_item_id: number
  business_activity_id: number | null
  invoice_type: string
  document_type: string | null
  invoice_number: string
  invoice_date: string
  counterparty_name: string
  counterparty_id: string | null
  counterparty_id_type: string | null
  net_amount: string
  vat_amount: string
  gross_amount: string
  expense_category: string | null
  rate_type: string
  deduction_rate: string
  is_exceptional: boolean
  created_by: number
  created_at: string
}

export interface VatInvoiceListResponse {
  items: VatInvoiceResponse[]
  total: number
  page: number
  page_size: number
}

export interface CreateVatInvoicePayload {
  invoice_type: 'income' | 'expense'
  business_activity_id?: number | null
  invoice_number?: string
  invoice_date?: string
  counterparty_name?: string
  gross_amount: string
  counterparty_id?: string | null
  counterparty_id_type?: string | null
  expense_category?: string | null
  rate_type?: string
  document_type?: string | null
}

export interface UpdateVatInvoicePayload {
  gross_amount?: string
  invoice_number?: string
  invoice_date?: string
  counterparty_name?: string
  counterparty_id?: string | null
  counterparty_id_type?: string | null
  expense_category?: string | null
  rate_type?: string
  document_type?: string | null
}

export interface VatAuditLogResponse {
  id: number
  work_item_id: number
  performed_by: number
  performed_by_name?: string | null
  action: string
  old_value: string | null
  new_value: string | null
  note: string | null
  performed_at: string
}

export interface VatAuditTrailResponse {
  items: VatAuditLogResponse[]
  total: number
  page: number
  page_size: number
}

export interface VatPeriodRow {
  work_item_id: number
  period: string
  period_type: VatType | null
  status: VatWorkItemStatus
  total_output_vat: string
  total_input_vat: string
  net_vat: string
  total_output_net: string
  total_input_net: string
  final_vat_amount: string | null
  filed_at: string | null
  submission_deadline: string | null
  statutory_deadline: string | null
  extended_deadline: string | null
  days_until_deadline: number | null
  is_overdue: boolean | null
}

interface VatGroupPeriod {
  period: string
  period_type: VatType
}

export interface VatWorkItemGroupSummary {
  group_key: string
  due_date: string
  period: string
  period_type: VatType
  periods?: VatGroupPeriod[]
  total_count: number
  filed_count: number
  pending_count: number
  not_filed_count: number
  overdue_count: number
}

export interface VatWorkItemGroupsResponse {
  groups: VatWorkItemGroupSummary[]
}

export interface VatWorkItemGroupItemsParams {
  page?: number
  page_size?: number
  status?: VatWorkItemStatus
  client_name?: string
}

export interface VatWorkItemGroupsParams {
  status?: VatWorkItemStatus
  client_name?: string
  period_type?: VatPeriodTypeFilter
  year?: number
}

export interface VatWorkItemGroupItemsResponse {
  items: VatWorkItemListItem[]
  total: number
  period: string
}

export interface VatAnnualSummary {
  year: number
  total_output_vat: string
  total_input_vat: string
  net_vat: string
  periods_count: number
  filed_count: number
}

export interface VatClientSummaryResponse {
  client_record_id: number
  periods: VatPeriodRow[]
  annual: VatAnnualSummary[]
}

export interface FileVatReturnPayload {
  submission_method: 'manual' | 'online' | 'representative'
  override_amount?: number | null
  override_justification?: string | null
  submission_reference?: string
  is_amendment?: boolean
  amends_item_id?: number | null
}
