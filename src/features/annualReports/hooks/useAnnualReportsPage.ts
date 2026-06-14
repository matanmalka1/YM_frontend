import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useSeasonDashboard } from './useSeasonDashboard'
import { annualReportSeasonApi, annualReportsApi, annualReportsQK } from '../api'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { useState } from 'react'
import { ANNUAL_REPORTS_TAX_YEAR_DESC_PARAMS } from '../report.constants'

export const useAnnualReportsPage = () => {
  const { searchParams, setFilter, setFilters, resetFilters } = useSearchParamFilters()
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  const clientRecordId = searchParams.get('client_record_id') ?? ''
  const clientName = searchParams.get('client_name') ?? ''
  const status = searchParams.get('status') ?? ''
  const year = searchParams.get('year') ?? ''

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

  const handleMultiFilterChange = (updates: Record<string, string>) => setFilters(updates)

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

  return {
    taxYear,
    filingSeasonYear,
    defaultTaxYear,
    showCreate,
    openCreate: () => setShowCreate(true),
    closeCreate: () => setShowCreate(false),
    openReport,
    filters,
    handleFilterChange,
    handleMultiFilterChange,
    handleResetFilters,
    filteredReports,
    season: { ...season, isLoading, error },
  }
}
