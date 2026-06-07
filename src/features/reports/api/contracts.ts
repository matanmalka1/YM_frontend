export interface AgingBucket {
  total_clients: number;
  total_current: string;
  total_30_days: string;
  total_60_days: string;
  total_90_plus: string;
}

export interface AgingReportItem {
  client_record_id: number;
  client_name: string;
  total_outstanding: string;
  current: string;
  days_30: string;
  days_60: string;
  days_90_plus: string;
  oldest_invoice_date: string | null;
  oldest_invoice_days: number | null;
}

export interface AgingReportResponse {
  report_date: string;
  total_outstanding: string;
  items: AgingReportItem[];
  summary: AgingBucket;
  total: number;
  page: number;
  page_size: number;
}

export interface AnnualReportClientEntry {
  client_record_id: number;
  client_name: string;
  form_type: string | null;
  filing_deadline: string | null;
  days_until_deadline: number | null;
}

export interface AnnualReportStatusGroup {
  status: string;
  count: number;
  clients: AnnualReportClientEntry[];
}

export interface AnnualReportStatusReportResponse {
  tax_year: number;
  total: number;
  statuses: AnnualReportStatusGroup[];
}

export interface AdvancePaymentReportItem {
  client_record_id: number;
  office_client_number?: number | null;
  client_name: string;
  total_expected: string;
  total_paid: string;
  overdue_count: number;
  gap: string;
}

export interface AdvancePaymentReportResponse {
  year: number;
  month: number | null;
  total_expected: string;
  total_paid: string;
  collection_rate: number;
  total_gap: string;
  items: AdvancePaymentReportItem[];
}

export interface VatComplianceItem {
  client_record_id: number;
  client_name: string;
  year?: number | null;
  period_type?: string | null;
  reporting_frequency?: string | null;
  grouping_key?: string | null;
  periods_expected: number;
  periods_filed: number;
  periods_open: number;
  on_time_count: number;
  late_count: number;
  compliance_rate: number;
}

export interface StalePendingItem {
  client_record_id: number;
  client_name: string;
  period: string;
  days_pending: number;
}

export interface VatComplianceReportResponse {
  year: number;
  total_clients: number;
  total: number;
  page: number;
  page_size: number;
  items: VatComplianceItem[];
  stale_pending: StalePendingItem[];
}

export type ExportFormat = "excel" | "pdf";

export interface ReportExportResult {
  filename: string;
}
