import type { BackendAction } from '@/lib/actions/types'
import type { PaginatedResponse } from '@/types'

export type AnnualReportStatus =
  | 'not_started'
  | 'collecting_docs'
  | 'docs_complete'
  | 'in_preparation'
  | 'pending_client'
  | 'submitted'
  | 'accepted'
  | 'assessment_issued'
  | 'objection_filed'
  | 'closed'
  | 'amended'
  | 'canceled'

export type ClientTypeForReport =
  | 'individual'
  | 'self_employed'
  | 'corporation'
  | 'public_institution'
  | 'partnership'
  | 'control_holder'
  | 'exempt_dealer'

export type DeadlineType = 'standard' | 'extended' | 'custom'

export type AnnualReportScheduleKey =
  | 'schedule_a'
  | 'schedule_b'
  | 'schedule_gimmel'
  | 'schedule_dalet'
  | 'form_150'
  | 'form_1504'
  | 'form_6111'
  | 'form_1344'
  | 'form_1399'
  | 'form_1350'
  | 'form_1327'
  | 'form_1342'
  | 'form_1343'
  | 'form_1348'
  | 'form_858'

export type StageKey =
  | 'material_collection'
  | 'in_progress'
  | 'final_review'
  | 'client_signature'
  | 'transmitted'
  | 'post_submission'

export type IncomeSourceType =
  | 'business'
  | 'salary'
  | 'interest'
  | 'dividends'
  | 'capital_gains'
  | 'rental'
  | 'foreign'
  | 'pension'
  | 'other'

export type ExpenseCategoryType =
  | 'office_rent'
  | 'professional_services'
  | 'salaries'
  | 'depreciation'
  | 'vehicle'
  | 'marketing'
  | 'insurance'
  | 'communication'
  | 'travel'
  | 'training'
  | 'bank_fees'
  | 'other'

export interface AnnualReportFull {
  id: number
  client_record_id: number
  office_client_number?: number | null
  client_name?: string | null
  client_id_number?: string | null
  business_name?: string | null
  tax_year: number
  client_type: ClientTypeForReport
  form_type: string
  status: AnnualReportStatus
  deadline_type: DeadlineType
  filing_deadline: string | null
  custom_deadline_note: string | null
  submitted_at: string | null
  ita_reference: string | null
  assessment_amount: string | null
  refund_due: string | null
  tax_due: string | null
  has_rental_income: boolean
  has_capital_gains: boolean
  has_foreign_income: boolean
  has_depreciation: boolean
  submission_method: string | null
  extension_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
  assigned_to: number | null
  created_by: number
  schedules?: ScheduleEntry[]
  status_history?: StatusHistoryEntry[]
  pension_contribution?: string | null
  donation_amount?: string | null
  other_credits?: string | null
  credit_points?: number | null
  pension_credit_points?: number | null
  life_insurance_credit_points?: number | null
  tuition_credit_points?: number | null
  client_approved_at?: string | null
  internal_notes?: string | null
  amendment_reason?: string | null
  tax_refund_amount?: number | null
  tax_due_amount?: number | null
  total_income?: string | null
  total_expenses?: string | null
  taxable_income?: string | null
  profit?: string | null
  final_balance?: string | null
  available_actions?: BackendAction[]
  available_transitions?: AnnualReportStatus[]
}

export interface ReportDetailResponse {
  report_id: number
  pension_contribution: string | null
  donation_amount: string | null
  other_credits: string | null
  credit_points?: number | null
  pension_credit_points?: number | null
  life_insurance_credit_points?: number | null
  tuition_credit_points?: number | null
  tax_refund_amount?: number | null
  tax_due_amount?: number | null
  client_approved_at: string | null
  internal_notes: string | null
  amendment_reason: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ScheduleEntry {
  id: number
  annual_report_id: number
  schedule: AnnualReportScheduleKey
  is_required: boolean
  is_complete: boolean
  notes: string | null
  created_at: string
  completed_at: string | null
  completed_by: number | null
}

export interface StatusHistoryEntry {
  id: number
  annual_report_id: number
  from_status: AnnualReportStatus | null
  to_status: AnnualReportStatus
  changed_by: number
  note: string | null
  occurred_at: string
}

export type StatusHistoryPagedResponse = PaginatedResponse<StatusHistoryEntry>

export interface SeasonSummary {
  tax_year: number
  filing_season_year: number
  total: number
  not_started: number
  collecting_docs: number
  docs_complete: number
  in_preparation: number
  pending_client: number
  submitted: number
  accepted: number
  assessment_issued: number
  objection_filed: number
  closed: number
  amended: number
  completion_rate: number
  overdue_count: number
}

export interface DefaultTaxYearResponse {
  tax_year: number
}

export type AnnualReportListResponse = PaginatedResponse<AnnualReportFull>

export interface CreateAnnualReportPayload {
  client_record_id: number
  tax_year: number
  client_type: ClientTypeForReport
  deadline_type?: DeadlineType
  assigned_to?: number | null
  notes?: string | null
  submission_method?: string | null
  extension_reason?: string | null
  has_rental_income?: boolean
  has_capital_gains?: boolean
  has_foreign_income?: boolean
  has_depreciation?: boolean
}

export interface StatusTransitionPayload {
  status: AnnualReportStatus
  note?: string | null
  ita_reference?: string | null
  submission_method?: string | null
  assessment_amount?: string | null
  refund_due?: string | null
  tax_due?: string | null
}

export interface IncomeLineResponse {
  id: number
  annual_report_id: number
  source_type: IncomeSourceType
  amount: string
  description: string | null
  created_at: string
  updated_at: string | null
}

export interface ExpenseLineResponse {
  id: number
  annual_report_id: number
  category: ExpenseCategoryType
  amount: string
  recognition_rate: string
  recognized_amount: string
  external_document_reference: string | null
  supporting_document_id: number | null
  supporting_document_filename: string | null
  description: string | null
  created_at: string
  updated_at: string | null
}

export interface FinancialSummaryResponse {
  annual_report_id: number
  total_income: string
  gross_expenses: string
  recognized_expenses: string
  taxable_income: string
  income_lines: IncomeLineResponse[]
  expense_lines: ExpenseLineResponse[]
}

export interface ReadinessCheckResponse {
  annual_report_id: number
  is_ready: boolean
  issues: string[]
  completion_pct: number
}

export interface BracketBreakdownItem {
  rate: number
  from_amount: string
  to_amount: string | null
  taxable_in_bracket: string
  tax_in_bracket: string
}

export interface NationalInsuranceBreakdown {
  base_amount: string
  high_amount: string
  total: string
}

export interface TaxCalculationResult {
  taxable_income: string
  pension_deduction: string
  tax_before_credits: string
  credit_points_value: string
  donation_credit: string
  other_credits: string
  tax_after_credits: string
  net_profit: string
  effective_rate: number
  national_insurance: NationalInsuranceBreakdown
  brackets: BracketBreakdownItem[]
  total_liability: string | null
  total_credit_points: number
}

export interface AnnexDataLine {
  id: number
  annual_report_id: number
  schedule: AnnualReportScheduleKey
  line_number: number
  data: Record<string, unknown>
  notes: string | null
  created_at: string
  updated_at: string | null
}

export type AnnexDataPagedResponse = PaginatedResponse<AnnexDataLine>

export interface AnnexDataAddPayload {
  data: Record<string, unknown>
  notes?: string | null
}

export interface AdvancesSummary {
  total_advances_paid: string
  advances_count: number
  final_balance: string
  balance_type: 'due' | 'refund' | 'zero'
}

export interface IncomeLinePayload {
  source_type: IncomeSourceType
  amount: string
  description?: string | null
}

export interface ExpenseLinePayload {
  category: ExpenseCategoryType
  amount: string
  description?: string | null
  recognition_rate?: string | null
  external_document_reference?: string | null
  supporting_document_id?: number | null
}

export interface TaxCalculationSaveRequest {
  tax_due?: string | null
  refund_due?: string | null
}

export interface TaxCalculationSaveResponse {
  annual_report_id: number
  tax_due: string | null
  refund_due: string | null
  saved_at: string
}

export interface VatAutoPopulateResponse {
  annual_report_id: number
  income_lines_created: number
  expense_lines_created: number
  income_total: string
  expense_total: string
  lines_deleted: number
}
