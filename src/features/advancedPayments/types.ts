export type AdvancePaymentStatus = 'pending' | 'paid' | 'partial'
export type AdvancePaymentTimingStatus = 'on_time' | 'overdue'
export type AdvancePaymentMethod = 'bank_transfer' | 'credit_card' | 'check' | 'direct_debit' | 'cash' | 'other'

export interface AdvancePaymentRow {
  id: number
  client_record_id: number
  business_name?: string | null
  period: string
  period_months_count: 1 | 2
  expected_amount: string | null
  paid_amount: string | null
  status: AdvancePaymentStatus
  due_date: string
  paid_at: string | null
  payment_method: AdvancePaymentMethod | null
  annual_report_id: number | null
  notes: string | null
  delta: string | null
  turnover_amount: string | null
  advance_rate: string | null
  calculated_amount: string | null
  override_amount: string | null
  live_turnover: string | null
  missing_turnover: boolean
  timing_status: AdvancePaymentTimingStatus
  paid_late: boolean
  created_at: string
  updated_at: string | null
}

export interface ListAdvancePaymentsParams {
  client_id: number
  year: number
  status?: AdvancePaymentStatus[]
  page?: number
  page_size?: number
}

export interface CreateAdvancePaymentPayload {
  period: string
  period_months_count?: 1 | 2
  turnover_amount?: string | null
  advance_rate?: string | null
  override_amount?: string | null
  paid_amount?: string | null
  payment_method?: AdvancePaymentMethod | null
  annual_report_id?: number | null
  notes?: string | null
}

export interface UpdateAdvancePaymentPayload {
  paid_amount?: string
  expected_amount?: string | null
  turnover_amount?: string | null
  override_amount?: string | null
  status?: AdvancePaymentStatus
  paid_at?: string | null
  payment_method?: AdvancePaymentMethod | null
  notes?: string | null
}

export interface PrefillTurnoverResponse {
  period: string
  period_months_count: 1 | 2
  turnover_amount: string | null
  vat_work_item_id: number | null
  source: 'vat_filed' | 'vat_pending' | 'none'
}

export interface AdvancePaymentOverviewRow {
  id: number
  client_record_id: number
  office_client_number?: number | null
  business_name: string
  id_number?: string | null
  period: string
  period_months_count: 1 | 2
  expected_amount: string | null
  paid_amount: string | null
  delta: string | null
  status: AdvancePaymentStatus
  timing_status: AdvancePaymentTimingStatus
  due_date: string
  payment_method: AdvancePaymentMethod | null
  turnover_amount: string | null
  calculated_amount: string | null
  override_amount: string | null
  live_turnover: string | null
  missing_turnover: boolean
  advance_rate: string | null
}

export interface ListAdvancePaymentsOverviewParams {
  year: number
  month?: number
  status?: AdvancePaymentStatus[]
  page?: number
  page_size?: number
}

export interface AdvancePaymentOverviewResponse {
  items: AdvancePaymentOverviewRow[]
  page: number
  page_size: number
  total: number
  total_expected: string | null
  total_paid: string | null
  collection_rate: number | null
}

export interface MonthBatchSummary {
  year: number
  month: number
  due_date?: string
  source_batches?: MonthBatchSummary[]
  period_months_count: 1 | 2
  client_count: number
  missing_turnover_count: number
  overdue_count: number
  pending_count: number
  total_expected: string | null
  total_paid: string | null
  collection_rate: number
}

export type AdvancePaymentDueDateGroup = MonthBatchSummary

export interface AdvancePaymentSuggestionResponse {
  client_record_id: number
  year: number
  suggested_amount: string | null
  has_data: boolean
}

export interface AnnualKPIResponse {
  client_record_id: number
  year: number
  total_expected: string
  total_paid: string
  collection_rate: number
  overdue_count: number
  on_time_count: number
}
