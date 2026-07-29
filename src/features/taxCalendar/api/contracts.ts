export type TaxCalendarObligationType = 'vat' | 'advance_payment' | 'annual_report'

interface TaxCalendarGroupsSummary {
  groups: number
  linked: number
  open: number
  overdue: number
  done: number
}

export interface TaxCalendarGroupListResponse {
  items: TaxCalendarGroup[]
  page: number
  page_size: number
  total: number
  summary: TaxCalendarGroupsSummary
}

export interface TaxCalendarGroup {
  tax_calendar_entry_id: number
  obligation_type: TaxCalendarObligationType
  period: string | null
  period_months_count: number | null
  tax_year: number
  /** Null for annual obligations — no single statutory date applies to every client. */
  regulatory_due_date: string | null
  /** Null when nothing linked has a known deadline (e.g. custom-deadline annual reports). */
  effective_due_date_min: string | null
  effective_due_date_max: string | null
  linked_count: number
  open_count: number
  done_count: number
  overdue_count: number
}

export interface TaxCalendarGroupsParams {
  tax_year_after?: number
  tax_year_before?: number
  obligation_type?: TaxCalendarObligationType
  status?: 'all' | 'open' | 'overdue' | 'done'
  due_after?: string
  order?: 'period' | 'due'
  include_empty?: boolean
  client_record_id?: number
  client_search?: string
  page?: number
  page_size?: number
}
