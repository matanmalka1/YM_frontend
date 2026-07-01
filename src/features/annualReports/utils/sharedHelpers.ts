import type { AnnualReportListItem } from '../api'
import { parseAnnualReportCalendarDate } from '../constants/sharedConstants'

export const getClientReportName = (report: AnnualReportListItem): string =>
  report.client_name ?? `לקוח #${report.client_record_id}`

export const getDaysOverdue = (deadline: string | null): number | null => {
  const deadlineDate = parseAnnualReportCalendarDate(deadline)
  if (!deadlineDate) return null
  const diff = Math.floor((Date.now() - deadlineDate.getTime()) / 86_400_000)
  return diff > 0 ? diff : null
}
