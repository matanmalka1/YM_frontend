import { useEffect, useMemo } from 'react'
import { FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useSeasonDashboard } from './useSeasonDashboard'
import { annualReportSeasonApi, annualReportsApi, annualReportsQK } from '../api'
import type { AnnualReportListItem } from '../api'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { useState } from 'react'
import { ANNUAL_REPORTS_TAX_YEAR_DESC_PARAMS } from '../report.constants'

export const useAnnualReportsPage = () => {
  const { getParam, setFilter, resetFilters } = useSearchParamFilters()
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  const clientRecordId = getParam('client_record_id')
  const clientName = getParam('client_name')
  const status = getParam('status')
  const year = getParam('year')

  const defaultTaxYearQuery = useQuery({
    queryKey: annualReportsQK.defaultTaxYear,
    queryFn: annualReportSeasonApi.getDefaultTaxYear,
    staleTime: QUERY_STALE_TIME.long,
  })
  const defaultTaxYear = defaultTaxYearQuery.data?.tax_year
  const defaultTaxYearPending = defaultTaxYearQuery.isPending

  useEffect(() => {
    if (defaultTaxYear == null) return
    if (!year) setFilter('year', String(defaultTaxYear), false)
  }, [defaultTaxYear]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedTaxYear = year ? Number(year) : undefined
  const allYearsMode = !year

  const apiFilters = {
    client_record_id: clientRecordId ? Number(clientRecordId) : undefined,
    status: status || undefined,
  }

  const season = useSeasonDashboard(selectedTaxYear, !allYearsMode && !defaultTaxYearPending, apiFilters)

  const allReportsQuery = useQuery({
    enabled: allYearsMode && !defaultTaxYearPending && !defaultTaxYearQuery.error,
    queryKey: [...annualReportsQK.all, 'all-years', apiFilters] as const,
    queryFn: () =>
      annualReportsApi.listReports({
        ...ANNUAL_REPORTS_TAX_YEAR_DESC_PARAMS,
        ...apiFilters,
      }),
    staleTime: QUERY_STALE_TIME.default,
  })

  const taxYear = allYearsMode ? undefined : (season.summary?.tax_year ?? selectedTaxYear)
  const filingSeasonYear = allYearsMode ? undefined : season.summary?.filing_season_year

  const openReport = (id: number) => navigate(`/tax/reports/${id}`, { state: { from: '/tax/reports' } })

  const filters = { client_record_id: clientRecordId, client_name: clientName, status, year }

  const handleFilterChange = (key: string, value: string) => setFilter(key, value)

  const handleResetFilters = () => resetFilters(defaultTaxYear != null ? { year: String(defaultTaxYear) } : {})

  const filteredReports = useMemo(
    () => (allYearsMode ? (allReportsQuery.data?.items ?? []) : season.reports),
    [allYearsMode, allReportsQuery.data?.items, season.reports],
  )

  const isLoading = defaultTaxYearPending || (allYearsMode ? allReportsQuery.isPending : season.isLoading)
  const error = defaultTaxYearQuery.error
    ? 'שגיאה בטעינת שנת מס'
    : allYearsMode
      ? allReportsQuery.error
        ? 'שגיאה בטעינת דוחות'
        : null
      : season.error

  const openCreate = () => setShowCreate(true)
  const closeCreate = () => setShowCreate(false)

  const taxYearLabel = taxYear ? String(taxYear) : '...'

  return {
    status: { isLoading, error },
    headerProps: {
      title: `דוחות שנתיים לשנת המס ${taxYearLabel}`,
      description: filingSeasonYear ? `עונת הגשה ${filingSeasonYear}` : 'ניהול ומעקב אחר דוחות שנתיים',
      taxYear,
    },
    stats: { summary: season.summary },
    filters: {
      values: filters,
      defaultYear: defaultTaxYear,
      onFilterChange: handleFilterChange,
      resetFilters: handleResetFilters,
    },
    table: {
      reports: filteredReports,
      isLoading,
      taxYear,
      onSelect: (report: AnnualReportListItem) => openReport(report.id),
      emptyState: {
        icon: FileText,
        variant: 'illustration' as const,
        title: `עדיין אין דוחות שנתיים לשנת המס ${taxYearLabel}`,
        message: taxYear ? `לחץ על "דוח שנתי ${taxYear}" כדי להתחיל` : 'בחר שנת מס כדי להתחיל',
        action: taxYear ? { label: `דוח שנתי ${taxYear}`, onClick: openCreate } : undefined,
      },
    },
    banner: { overdue: season.overdue, onSelect: openReport },
    modals: {
      openCreate,
      createProps: { open: showCreate, onClose: closeCreate, taxYear },
    },
  }
}
