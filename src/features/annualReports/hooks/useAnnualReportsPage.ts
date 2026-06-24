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
import { ANNUAL_REPORTS_TAX_YEAR_DESC_PARAMS } from '../constants/reportConstants'
import { STATUS_LABELS } from '../api/utils'
import type { AnnualReportStatus } from '../api/contracts'
import { ALL_STATUSES_OPTION } from '@/constants/filterOptions.constants'
import { getOperationalYearOptions } from '@/constants/periodOptions.constants'
import { ANNUAL_REPORTS_ERROR_MESSAGES } from '../errorMessages'

// All-years uses an explicit sentinel (not '') so an empty `year` param unambiguously means
// "uninitialized" → apply the default tax year. This keeps re-navigating to /tax/reports (which
// drops the query string) from silently falling into all-years mode instead of the default view.
const ALL_YEARS_VALUE = 'all'
const ALL_YEARS_OPTION = { value: ALL_YEARS_VALUE, label: 'כל השנים' } as const

const STATUS_OPTIONS = [
  ALL_STATUSES_OPTION,
  ...(Object.entries(STATUS_LABELS) as [AnnualReportStatus, string][]).map(([value, label]) => ({
    value,
    label,
  })),
]

const getYearOptions = (defaultYear?: number) => {
  const options = getOperationalYearOptions()
  if (!defaultYear || options.some((option) => option.value === String(defaultYear))) return options
  return [{ value: String(defaultYear), label: String(defaultYear) }, ...options]
}

const buildAnnualReportsFilterFields = (defaultYear?: number) => [
  { type: 'client-picker' as const, idKey: 'client_record_id', nameKey: 'client_name' },
  { type: 'select' as const, key: 'status', label: 'סטטוס', options: STATUS_OPTIONS },
  {
    type: 'select' as const,
    key: 'year',
    label: 'שנת מס',
    options: [ALL_YEARS_OPTION, ...getYearOptions(defaultYear)],
    defaultValue: defaultYear ? String(defaultYear) : '',
  },
]

export const useAnnualReportsPage = () => {
  const { getParam, setFilter, resetFilters } = useSearchParamFilters()
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  const clientRecordId = getParam('client_record_id')
  const clientName = getParam('client_name')
  const status = getParam('status')
  const year = getParam('year')

  const {
    data: defaultTaxYearData,
    isPending: defaultTaxYearPending,
    error: defaultTaxYearError,
  } = useQuery({
    queryKey: annualReportsQK.defaultTaxYear,
    queryFn: annualReportSeasonApi.getDefaultTaxYear,
    staleTime: QUERY_STALE_TIME.long,
  })
  const defaultTaxYear = defaultTaxYearData?.tax_year

  // Re-apply the default tax year whenever `year` is empty — including when navigating to
  // /tax/reports again drops the query string. `year` is in the deps (not just defaultTaxYear,
  // which is cached and never changes) so this fires on every reset; the ALL_YEARS_VALUE sentinel
  // means an explicit all-years selection is not empty and is left untouched.
  useEffect(() => {
    if (defaultTaxYear == null) return
    if (!year) setFilter('year', String(defaultTaxYear), false)
  }, [defaultTaxYear, year]) // eslint-disable-line react-hooks/exhaustive-deps

  const allYearsMode = year === ALL_YEARS_VALUE
  const isInitializing = !year
  const selectedTaxYear = allYearsMode || isInitializing ? undefined : Number(year)

  const apiFilters = {
    client_record_id: clientRecordId ? Number(clientRecordId) : undefined,
    status: status || undefined,
  }

  const season = useSeasonDashboard(selectedTaxYear, selectedTaxYear != null && !defaultTaxYearPending, apiFilters)

  const {
    data: allReportsData,
    isPending: allReportsPending,
    error: allReportsError,
  } = useQuery({
    enabled: allYearsMode && !defaultTaxYearPending && !defaultTaxYearError,
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
  const filterFields = useMemo(() => buildAnnualReportsFilterFields(defaultTaxYear), [defaultTaxYear])

  const handleFilterChange = (key: string, value: string) => setFilter(key, value)

  const handleResetFilters = () => resetFilters(defaultTaxYear != null ? { year: String(defaultTaxYear) } : {})

  const filteredReports = useMemo(
    () => (allYearsMode ? (allReportsData?.items ?? []) : season.reports),
    [allYearsMode, allReportsData?.items, season.reports],
  )

  const isLoading =
    defaultTaxYearPending || isInitializing || (allYearsMode ? allReportsPending : season.isLoading)
  const error = defaultTaxYearError
    ? ANNUAL_REPORTS_ERROR_MESSAGES.reports.taxYearLoad
    : allYearsMode
      ? allReportsError
        ? ANNUAL_REPORTS_ERROR_MESSAGES.reports.seasonListLoad
        : null
      : season.error

  const openCreate = () => setShowCreate(true)
  const closeCreate = () => setShowCreate(false)

  const taxYearLabel = taxYear ? String(taxYear) : '...'

  return {
    status: { isLoading, error },
    headerProps: {
      title: allYearsMode ? 'דוחות שנתיים — כל השנים' : `דוחות שנתיים לשנת המס ${taxYearLabel}`,
      description: filingSeasonYear ? `עונת הגשה ${filingSeasonYear}` : 'ניהול ומעקב אחר דוחות שנתיים',
      taxYear,
    },
    stats: { summary: season.summary },
    filters: {
      fields: filterFields,
      values: filters,
      onChange: handleFilterChange,
      onReset: handleResetFilters,
    },
    table: {
      reports: filteredReports,
      isLoading,
      taxYear,
      onSelect: (report: AnnualReportListItem) => openReport(report.id),
      emptyState: {
        icon: FileText,
        variant: 'illustration' as const,
        title: allYearsMode ? 'לא נמצאו דוחות שנתיים' : `עדיין אין דוחות שנתיים לשנת המס ${taxYearLabel}`,
        message: allYearsMode
          ? 'לא נוצרו עדיין דוחות שנתיים עבור אף שנת מס'
          : taxYear
            ? `לחץ על "דוח שנתי ${taxYear}" כדי להתחיל`
            : 'בחר שנת מס כדי להתחיל',
        action: !allYearsMode && taxYear ? { label: `דוח שנתי ${taxYear}`, onClick: openCreate } : undefined,
      },
    },
    banner: { overdue: season.overdue, onSelect: openReport },
    modals: {
      openCreate,
      createProps: { open: showCreate, onClose: closeCreate, taxYear },
    },
  }
}
