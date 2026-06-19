import { useQuery } from '@tanstack/react-query'
import { annualReportSeasonApi, annualReportsQK } from '../api'
import { getErrorMessage } from '../../../utils/utils'
import { ANNUAL_REPORTS_COMPLETE_LIST_PARAMS } from '../constants/reportConstants'

interface SeasonFilters {
  client_record_id?: number
  status?: string
}

export const useSeasonDashboard = (taxYear?: number, enabled = true, filters?: SeasonFilters) => {
  const {
    data: summaryData,
    isPending: summaryPending,
    error: summaryError,
  } = useQuery({
    enabled,
    queryKey: taxYear ? annualReportsQK.seasonSummary(taxYear) : annualReportsQK.activeSeasonSummary,
    queryFn: () =>
      taxYear ? annualReportSeasonApi.getSeasonSummary(taxYear) : annualReportSeasonApi.getActiveSeasonSummary(),
  })

  const {
    data: reportsData,
    isPending: reportsPending,
    error: reportsError,
  } = useQuery({
    enabled,
    queryKey: taxYear
      ? [...annualReportsQK.seasonList(taxYear), filters]
      : [...annualReportsQK.activeSeasonList, filters],
    queryFn: () =>
      taxYear
        ? annualReportSeasonApi.listSeasonReports(taxYear, { ...ANNUAL_REPORTS_COMPLETE_LIST_PARAMS, ...filters })
        : annualReportSeasonApi.listActiveSeasonReports({ ...ANNUAL_REPORTS_COMPLETE_LIST_PARAMS, ...filters }),
  })

  const { data: overdueData } = useQuery({
    enabled: enabled && Boolean(summaryData?.tax_year),
    queryKey: annualReportsQK.overdue(summaryData?.tax_year ?? 0),
    queryFn: () => annualReportSeasonApi.getOverdue(summaryData?.tax_year),
  })

  return {
    summary: summaryData ?? null,
    reports: reportsData?.items ?? [],
    overdue: overdueData ?? [],
    isLoading: summaryPending || reportsPending,
    error: summaryError
      ? getErrorMessage(summaryError, 'שגיאה בטעינת סיכום עונה')
      : reportsError
        ? getErrorMessage(reportsError, 'שגיאה בטעינת דוחות')
        : null,
  }
}
