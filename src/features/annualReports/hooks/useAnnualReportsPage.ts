import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useSeasonDashboard } from './useSeasonDashboard'
import { annualReportSeasonApi, annualReportsApi, annualReportsQK } from '../api'
import type { AnnualReportsFilters } from '../components/shared/AnnualReportsFiltersBar'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

const DEFAULT_FILTERS: AnnualReportsFilters = {
  client_id: '',
  client_name: '',
  status: '',
  year: '',
}

export const useAnnualReportsPage = () => {
  const [showCreate, setShowCreate] = useState(false)
  const [filters, setFilters] = useState<AnnualReportsFilters>(DEFAULT_FILTERS)
  const navigate = useNavigate()

  const defaultTaxYearQuery = useQuery({
    queryKey: annualReportsQK.defaultTaxYear,
    queryFn: annualReportSeasonApi.getDefaultTaxYear,
    staleTime: QUERY_STALE_TIME.default,
  })
  const defaultTaxYear = defaultTaxYearQuery.data?.tax_year
  const defaultTaxYearPending = defaultTaxYearQuery.isPending

  useEffect(() => {
    if (defaultTaxYear == null) return
    setFilters((prev) => (prev.year ? prev : { ...prev, year: String(defaultTaxYear) }))
  }, [defaultTaxYear])

  const selectedTaxYear = filters.year ? Number(filters.year) : undefined
  const allYearsMode = !filters.year

  const season = useSeasonDashboard(selectedTaxYear, !allYearsMode && !defaultTaxYearPending)

  const allReportsQuery = useQuery({
    enabled: allYearsMode && !defaultTaxYearPending && !defaultTaxYearQuery.error,
    queryKey: [...annualReportsQK.all, 'all-years'] as const,
    queryFn: () => annualReportsApi.listReports({ page: 1, page_size: 200 }),
    staleTime: QUERY_STALE_TIME.default,
  })

  const taxYear = allYearsMode ? undefined : (season.summary?.tax_year ?? selectedTaxYear)
  const filingSeasonYear = allYearsMode ? undefined : season.summary?.filing_season_year

  const openReport = (id: number) => navigate(`/tax/reports/${id}`, { state: { from: '/tax/reports' } })

  const handleFilterChange = (key: keyof AnnualReportsFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () =>
    setFilters({ ...DEFAULT_FILTERS, year: defaultTaxYear == null ? '' : String(defaultTaxYear) })

  const baseReports = useMemo(
    () => (allYearsMode ? (allReportsQuery.data?.items ?? []) : season.reports),
    [allYearsMode, allReportsQuery.data?.items, season.reports],
  )

  const filteredReports = useMemo(() => {
    let reports = baseReports
    if (filters.client_id) {
      reports = reports.filter((r) => r.client_record_id === Number(filters.client_id))
    }
    if (filters.status) {
      reports = reports.filter((r) => r.status === filters.status)
    }
    return reports
  }, [baseReports, filters.client_id, filters.status])

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
    handleResetFilters,
    filteredReports,
    season: { ...season, isLoading, error },
  }
}
