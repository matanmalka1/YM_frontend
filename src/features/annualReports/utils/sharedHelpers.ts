import type { AnnualReportListItem } from '../api'

export const getClientReportName = (report: AnnualReportListItem): string =>
  report.client_name ?? `לקוח #${report.client_record_id}`
