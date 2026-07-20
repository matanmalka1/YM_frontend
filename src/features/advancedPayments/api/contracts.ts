export type AdvancePaymentStatus = 'pending' | 'paid' | 'partial'
type AdvancePaymentTimingStatus = 'on_time' | 'overdue'
export type AdvancePaymentMethod = 'bank_transfer' | 'credit_card' | 'check' | 'direct_debit' | 'cash' | 'other'

export interface AdvancePaymentRow {
  id: number
  client_record_id: number
  period: string
  period_months_count: 1 | 2
  expected_amount: string
  paid_amount: string
  status: AdvancePaymentStatus
  due_date: string
  due_date_effective?: string | null
  paid_at: string | null
  payment_method: AdvancePaymentMethod | null
  annual_report_id: number | null
  notes: string | null
  delta: string
  turnover_amount: string | null
  turnover_source: TurnoverSource | null
  turnover_snapshot_at: string | null
  advance_rate: string | null
  calculated_amount: string
  override_amount: string | null
  available_turnover: AvailableTurnover | null
  missing_turnover: boolean
  timing_status: AdvancePaymentTimingStatus
  paid_late: boolean
  created_at: string
  updated_at: string | null
}

export interface ListAdvancePaymentsParams {
  client_record_id: number
  year: number
  status?: AdvancePaymentStatus[]
  page?: number
  page_size?: number
}

export interface CreateAdvancePaymentPayload {
  period: string
  period_months_count?: 1 | 2 | null
  turnover_amount?: string | null
  advance_rate?: string | null
  override_amount?: string | null
  paid_amount?: string | null
  payment_method?: AdvancePaymentMethod | null
  annual_report_id?: number | null
  notes?: string | null
}

export interface UpdateAdvancePaymentPayload {
  paid_amount?: string | null
  expected_amount?: string | null
  turnover_amount?: string | null
  override_amount?: string | null
  paid_at?: string | null
  payment_method?: AdvancePaymentMethod | null
  notes?: string | null
}

export type TurnoverSource = 'manual' | 'vat_filed' | 'vat_pending'

/**
 * VAT turnover a period *could* be snapshotted from — not the payment's turnover.
 * It drives no amount on the record; it exists to surface an action not yet taken,
 * so it must never be rendered in the same slot as `turnover_amount`.
 */
export interface AvailableTurnover {
  amount: string
  source: Extract<TurnoverSource, 'vat_filed' | 'vat_pending'>
}

export interface AdvancePaymentOverviewRow {
  id: number
  client_record_id: number
  office_client_number?: number | null
  client_name: string
  id_number?: string | null
  period: string
  period_months_count: 1 | 2
  expected_amount: string
  paid_amount: string
  delta: string
  status: AdvancePaymentStatus
  timing_status: AdvancePaymentTimingStatus
  due_date: string
  due_date_effective?: string | null
  payment_method: AdvancePaymentMethod | null
  turnover_amount: string | null
  turnover_source: TurnoverSource | null
  turnover_snapshot_at: string | null
  calculated_amount: string
  override_amount: string | null
  available_turnover: AvailableTurnover | null
  missing_turnover: boolean
  advance_rate: string | null
}

export interface ListAdvancePaymentsOverviewParams {
  year: number
  month?: number
  due_date?: string
  period_months_count?: 1 | 2
  client_record_id?: number
  client_search?: string
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
  collection_rate: string | null
}

export interface MonthBatchSummary {
  year: number
  month: number
  due_date?: string | null
  source_batches?: MonthBatchSummary[]
  period_months_count: 1 | 2
  client_count: number
  missing_turnover_count: number
  overdue_count: number
  pending_count: number
  paid_count: number
  not_paid_count: number
  due_this_month_count: number
  total_expected: string | null
  total_paid: string | null
  collection_rate: string
}

export type AdvancePaymentDueDateGroup = MonthBatchSummary

export interface AnnualKPIResponse {
  client_record_id: number
  year: number
  total_expected: string
  total_paid: string
  collection_rate: string
  overdue_count: number
  on_time_count: number
}

export interface BulkRefreshTurnoverResponse {
  refreshed: number
  skipped_no_vat: number
  skipped_not_filed: number
  skipped_paid: number
}

export interface GenerateScheduleResponse {
  created: number
  skipped: number
}
