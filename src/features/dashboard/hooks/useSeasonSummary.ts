import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { annualReportSeasonApi, annualReportsQK } from '@/features/annualReports'
import type { annualReportSeasonApi as SeasonApiType } from '@/features/annualReports'

type SeasonSummaryData = Awaited<ReturnType<typeof SeasonApiType.getSeasonSummary>>

const getProgressColor = (pct: number) => {
  if (pct >= 75) return 'bg-positive-500'
  if (pct >= 40) return 'bg-info-500'
  return 'bg-warning-500'
}

const buildStats = (data: SeasonSummaryData) => {
  const completionPct = Math.round(Number(data.completion_rate))
  const done = data.submitted + data.closed
  return {
    taxYear: data.tax_year,
    filingSeasonYear: data.filing_season_year,
    total: data.total,
    notStarted: data.not_started,
    submitted: data.submitted,
    closed: data.closed,
    overdueCount: data.overdue_count,
    done,
    inProgress: data.total - data.not_started - done,
    completionPct,
    hasOverdue: data.overdue_count > 0,
    progressColor: getProgressColor(completionPct),
  }
}

export const useSeasonSummary = () => {
  const { data: activeSummaryData, isPending: activeSummaryPending } = useQuery({
    queryKey: annualReportsQK.activeSeasonSummary,
    queryFn: annualReportSeasonApi.getActiveSeasonSummary,
  })

  const activeStats = useMemo(() => (activeSummaryData ? buildStats(activeSummaryData) : null), [activeSummaryData])
  const shouldCheckNextTaxYear = activeStats !== null && activeStats.total === 0
  const nextTaxYear = activeStats ? activeStats.taxYear + 1 : null

  const { data: nextSummaryData, isPending: nextSummaryPending } = useQuery({
    enabled: shouldCheckNextTaxYear && nextTaxYear !== null,
    queryKey: nextTaxYear ? annualReportsQK.seasonSummary(nextTaxYear) : annualReportsQK.activeSeasonSummary,
    queryFn: () => annualReportSeasonApi.getSeasonSummary(nextTaxYear!),
  })

  const nextStats = useMemo(() => (nextSummaryData ? buildStats(nextSummaryData) : null), [nextSummaryData])

  const stats = nextStats && nextStats.total > 0 ? nextStats : activeStats
  const isPending = activeSummaryPending || (shouldCheckNextTaxYear && nextSummaryPending)

  return { stats, isPending }
}
