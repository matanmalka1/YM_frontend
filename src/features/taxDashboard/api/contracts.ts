export interface TaxSubmissionWidgetResponse {
  tax_year: number
  total_clients: number
  reports_submitted: number
  reports_in_progress: number
  reports_not_started: number
  submission_percentage: number
  total_refund_due: string
  total_tax_due: string
}
