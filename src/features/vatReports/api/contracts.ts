import type { BackendAction } from '@/lib/actions/types'
import type { PaginatedResponse } from '@/types'

export interface VatWorkItemResponse {
  id: number
  client_record_id: number
  office_client_number?: number | null
  client_name: string | null
  client_id_number?: string | null
  client_status: string | null
  period: string
  period_type: string | null
  status: string
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

export type VatWorkItemListResponse = PaginatedResponse<VatWorkItemResponse>

export interface VatWorkItemsListParams {
  status?: string
  page?: number
  page_size?: number
  period?: string
  period_type?: 'monthly' | 'bimonthly'
  client_name?: string
}

export interface VatWorkItemLookupResponse {
  id: number
  status: string
  period: string
}

export interface VatPeriodOptionResponse {
  period: string
  label: string
  start_month: number
  end_month: number
  is_opened: boolean
}

export interface VatPeriodOptionsResponse {
  client_record_id: number
  year: number
  period_type: 'monthly' | 'bimonthly' | 'exempt'
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
  expense_category: string | null
  rate_type: string
  deduction_rate: string
  is_exceptional: boolean
  created_by: number
  created_at: string
}

export interface VatInvoiceListResponse {
  items: VatInvoiceResponse[]
}

export interface CreateVatInvoicePayload {
  invoice_type: 'income' | 'expense'
  business_activity_id?: number | null
  invoice_number?: string
  invoice_date?: string
  counterparty_name?: string
  net_amount: string
  counterparty_id?: string | null
  counterparty_id_type?: string | null
  expense_category?: string | null
  rate_type?: string
  document_type?: string | null
}

export interface UpdateVatInvoicePayload {
  net_amount?: string
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
}

export interface VatPeriodRow {
  work_item_id: number
  period: string
  period_type: string | null
  status: string
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

export interface VatGroupPeriod {
  period: string
  period_type: string | null
}

export interface VatWorkItemGroupSummary {
  group_key: string
  due_date: string
  period: string
  period_type: string | null
  periods?: VatGroupPeriod[]
  total_count: number
  filed_count: number
  pending_count: number
}

export interface VatWorkItemGroupsResponse {
  groups: VatWorkItemGroupSummary[]
}

export interface VatWorkItemGroupItemsParams {
  page?: number
  page_size?: number
  status?: string
  client_name?: string
}

export interface VatWorkItemGroupItemsResponse {
  items: VatWorkItemResponse[]
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
