// Public surface of the annualReports feature — only import from this barrel externally
export { annualReportsApi, annualReportSeasonApi, annualReportsQK, getStatusLabel, getStatusVariant } from './api'
export { SeasonProgressBar } from './components/season/SeasonProgressBar'
export { SeasonReportsTable } from './components/season/SeasonReportsTable'
export { ClientAnnualReportsTab } from './components/shared/ClientAnnualReportsTab'
export { CreateReportModal } from './components/shared/CreateReportModal'
export { OverdueBanner } from './components/shared/OverdueBanner'
export { ANNUAL_REPORTS_COMPLETE_LIST_PARAMS } from './constants/reportConstants'

export { useAnnualReportsPage } from './hooks/useAnnualReportsPage'
export { AnnualReportDetail } from './pages/AnnualReportDetailPage'
export { AnnualReportsPage } from './pages/AnnualReportsPage'

export type { AnnualReportListItem } from './api'
