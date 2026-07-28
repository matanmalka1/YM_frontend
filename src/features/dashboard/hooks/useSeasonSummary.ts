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

export const buildSeasonStats = (data: SeasonSummaryData) => {
  const completionPct = Math.round(Number(data.completion_rate))
  // `submitted` and `closed` merged, so done is one count now.
  const done = data.submitted
  return {
    taxYear: data.tax_year,
    filingSeasonYear: data.filing_season_year,
    total: data.total,
    notStarted: data.awaiting_input,
    submitted: data.submitted,
    canceled: data.canceled,
    overdueCount: data.overdue_count,
    done,
    inProgress: data.input_received + data.in_progress + data.awaiting_verification,
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

  const activeStats = useMemo(() => (activeSummaryData ? buildSeasonStats(activeSummaryData) : null), [activeSummaryData])
  const shouldCheckNextTaxYear = activeStats !== null && activeStats.total === 0
  const nextTaxYear = activeStats ? activeStats.taxYear + 1 : null

  const { data: nextSummaryData, isPending: nextSummaryPending } = useQuery({
    enabled: shouldCheckNextTaxYear && nextTaxYear !== null,
    queryKey: nextTaxYear ? annualReportsQK.seasonSummary(nextTaxYear) : annualReportsQK.activeSeasonSummary,
    queryFn: () => annualReportSeasonApi.getSeasonSummary(nextTaxYear!),
  })

  const nextStats = useMemo(() => (nextSummaryData ? buildSeasonStats(nextSummaryData) : null), [nextSummaryData])

  const stats = nextStats && nextStats.total > 0 ? nextStats : activeStats
  const isPending = activeSummaryPending || (shouldCheckNextTaxYear && nextSummaryPending)

  return { stats, isPending }
}
