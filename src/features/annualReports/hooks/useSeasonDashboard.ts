import { useQuery } from '@tanstack/react-query'
import { annualReportSeasonApi, annualReportsQK } from '../api'
import { getErrorMessage } from '../../../utils/utils'
import { ANNUAL_REPORTS_COMPLETE_LIST_PARAMS } from '../constants/reportConstants'

interface SeasonFilters {
  client_record_id?: number
  status?: string
}

export const useSeasonDashboard = (taxYear?: number, enabled = true, filters?: SeasonFilters) => {
  const summaryQuery = useQuery({
    enabled,
    queryKey: taxYear ? annualReportsQK.seasonSummary(taxYear) : annualReportsQK.activeSeasonSummary,
    queryFn: () =>
      taxYear ? annualReportSeasonApi.getSeasonSummary(taxYear) : annualReportSeasonApi.getActiveSeasonSummary(),
  })

  const reportsQuery = useQuery({
    enabled,
    queryKey: taxYear
      ? [...annualReportsQK.seasonList(taxYear), filters]
      : [...annualReportsQK.activeSeasonList, filters],
    queryFn: () =>
      taxYear
        ? annualReportSeasonApi.listSeasonReports(taxYear, { ...ANNUAL_REPORTS_COMPLETE_LIST_PARAMS, ...filters })
        : annualReportSeasonApi.listActiveSeasonReports({ ...ANNUAL_REPORTS_COMPLETE_LIST_PARAMS, ...filters }),
  })

  const overdueQuery = useQuery({
    enabled: enabled && Boolean(summaryQuery.data?.tax_year),
    queryKey: annualReportsQK.overdue(summaryQuery.data?.tax_year ?? 0),
    queryFn: () => annualReportSeasonApi.getOverdue(summaryQuery.data?.tax_year),
  })

  return {
    summary: summaryQuery.data ?? null,
    reports: reportsQuery.data?.items ?? [],
    overdue: overdueQuery.data ?? [],
    isLoading: summaryQuery.isPending || reportsQuery.isPending,
    error: summaryQuery.error
      ? getErrorMessage(summaryQuery.error, 'שגיאה בטעינת סיכום עונה')
      : reportsQuery.error
        ? getErrorMessage(reportsQuery.error, 'שגיאה בטעינת דוחות')
        : null,
  }
}
