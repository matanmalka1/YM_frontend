import type { ObligationStatus } from '@/constants/obligationStatus.constants'

// Advance payments run the shared obligation lifecycle. `partial` is gone: a
// part-paid advance is `in_progress` with an outstanding balance, which is what
// partial always described — a fact about the amount, not a stage.
export type AdvancePaymentStatus = ObligationStatus
export type AdvancePaymentTimingStatus = 'on_time' | 'overdue'
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
  payment_reference: string | null
  annual_report_id: number | null
  notes: string | null
  delta: string
  turnover_amount: string | null
  turnover_source: TurnoverSource | null
  turnover_snapshot_at: string | null
  advance_rate: string | null
  calculated_amount: string
  override_amount: string | null
  withheld_amount: string | null
  available_turnover: AvailableTurnover | null
  vat_turnover_mismatch: VatTurnoverMismatch | null
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
  withheld_amount?: string | null
  paid_amount?: string | null
  payment_method?: AdvancePaymentMethod | null
  payment_reference?: string | null
  annual_report_id?: number | null
  notes?: string | null
}

export interface UpdateAdvancePaymentPayload {
  paid_amount?: string | null
  expected_amount?: string | null
  turnover_amount?: string | null
  override_amount?: string | null
  withheld_amount?: string | null
  paid_at?: string | null
  payment_method?: AdvancePaymentMethod | null
  payment_reference?: string | null
  notes?: string | null
}

export interface DeleteAdvancePaymentPayload {
  reason: string
}

export interface BulkRateUpdatePayload {
  advance_rate: string
  from_period: string
}

export interface BulkRateUpdateResponse {
  updated: number
  skipped: number
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

/**
 * Server-computed disagreement between the stored turnover and the period's
 * current VAT figure (beyond the backend tolerance). Render only — never
 * re-derive client-side. Mutually exclusive with `available_turnover`.
 */
export interface VatTurnoverMismatch {
  vat_amount: string
  difference: string
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
  payment_reference: string | null
  turnover_amount: string | null
  turnover_source: TurnoverSource | null
  turnover_snapshot_at: string | null
  calculated_amount: string
  override_amount: string | null
  withheld_amount: string | null
  available_turnover: AvailableTurnover | null
  vat_turnover_mismatch: VatTurnoverMismatch | null
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
  timing_status?: AdvancePaymentTimingStatus
  /** Server-computed: true keeps only rows carrying `vat_turnover_mismatch`. */
  vat_mismatch?: boolean
  sort_by?: 'client_name' | 'expected_amount' | 'paid_amount' | 'delta'
  order?: 'asc' | 'desc'
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
  vat_mismatch_count: number
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

export interface BulkMarkPaidPayload {
  payment_ids: number[]
  paid_at?: string | null
  payment_method?: AdvancePaymentMethod | null
  /** Each updated row gets a reference of the form `<prefix>-<payment_id>`. */
  reference_prefix?: string | null
}

export type BulkMarkPaidSkipReason = 'already_paid' | 'no_amount' | 'not_found'

export interface BulkMarkPaidResponse {
  updated: number[]
  skipped: { id: number; reason: BulkMarkPaidSkipReason }[]
}

/**
 * Rows left over from the client's previous reporting cadence.
 * `pending` is what a confirmed cleanup would remove (`removed` once it has);
 * `settled` is paid or part-paid and is never removed.
 */
export interface StaleCadenceSummary {
  removed: number
  pending: number
  settled: number
}

export interface GenerateSchedulePayload {
  clientRecordId: number
  year: number
  periodMonthsCount?: 1 | 2
  cleanupStaleCadence?: boolean
}

export interface GenerateScheduleResponse {
  created: number
  skipped: number
  stale_cadence: StaleCadenceSummary
}

export interface IneligibleClient {
  client_record_id: number
  client_name: string
  reason: 'frequency_not_set'
}

export interface BulkGeneratePreviewResponse {
  eligible_count: number
  ineligible: IneligibleClient[]
}

export interface BulkGeneratePayload {
  year: number
  cursor?: number | null
  cleanup_stale_cadence?: boolean
}

export interface BulkGenerateFailedClient {
  client_record_id: number
  client_name: string
  reason: string
}

export interface BulkGenerateResponse {
  clients_processed: number
  created: number
  skipped: number
  stale_cadence: StaleCadenceSummary
  failed: BulkGenerateFailedClient[]
  next_cursor: number | null
}
