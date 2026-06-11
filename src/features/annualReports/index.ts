// Public surface of the annualReports feature — only import from this barrel externally
export {
  annualReportsApi,
  annualReportFinancialsApi,
  annualReportStatusApi,
  annualReportTaxApi,
  annualReportSeasonApi,
  annualReportsQK,
  getStatusLabel,
  getStatusVariant,
  getAllowedTransitions,
  getClientTypeLabel,
  getScheduleLabel,
  getReportStageLabel,
  getStageColor,
  SEASON_PROGRESS_STAGES,
} from './api'
export { SeasonProgressBar } from './components/season/SeasonProgressBar'
export { SeasonReportsTable } from './components/season/SeasonReportsTable'
export { SeasonSummaryCards } from './components/season/SeasonSummaryCards'
export { AnnualReportFullPanel } from './components/panel/AnnualReportFullPanel'
export { ClientAnnualReportsTab } from './components/shared/ClientAnnualReportsTab'
export { CreateReportModal } from './components/shared/CreateReportModal'
export { OverdueBanner } from './components/shared/OverdueBanner'
export { AnnualReportsFiltersBar } from './components/shared/AnnualReportsFiltersBar'
export type { AnnualReportsFilters } from './components/shared/AnnualReportsFiltersBar'
export { useAnnualReportsPage } from './hooks/useAnnualReportsPage'
export { AnnualReportDetail } from './pages/AnnualReportDetailPage'
export { AnnualReportsPage } from './pages/AnnualReportsPage'
export { STAGE_ORDER, TAB_LABELS } from './types'
export type {
  AnnualReportFull,
  AnnualReportListItem,
  AnnualReportStatus,
  AnnualReportScheduleKey,
  ClientTypeForReport,
  ReportDetailResponse,
} from './api'
export type { ActiveTab } from './types'
