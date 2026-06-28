import { Banknote, CheckCircle2, Clock, TrendingUp, Users, XCircle } from 'lucide-react'
import type { StatsCardProps } from '@/components/ui/layout/StatsCard'
import { formatShekelAmount } from '@/utils/utils'
import type { TaxSubmissionWidgetResponse } from './api'
import { TAX_SUBMISSION_FILTERS, TAX_SUBMISSION_STAT_TITLES, type TaxSubmissionFilter } from './constants'

export interface TaxSubmissionStat {
  key: string
  title: string
  value: StatsCardProps['value']
  icon: StatsCardProps['icon']
  variant: NonNullable<StatsCardProps['variant']>
  filterValue?: TaxSubmissionFilter
}

export const buildTaxSubmissionStats = (data: TaxSubmissionWidgetResponse): TaxSubmissionStat[] => {
  const totalRefundDue = Number(data.total_refund_due)
  const totalTaxDue = Number(data.total_tax_due)
  const stats: TaxSubmissionStat[] = [
    {
      key: 'total',
      title: TAX_SUBMISSION_STAT_TITLES.total,
      value: data.total_clients,
      icon: Users,
      variant: 'neutral',
      filterValue: TAX_SUBMISSION_FILTERS.all,
    },
    {
      key: 'submitted',
      title: TAX_SUBMISSION_STAT_TITLES.submitted,
      value: data.reports_submitted,
      icon: CheckCircle2,
      variant: 'positive',
      filterValue: TAX_SUBMISSION_FILTERS.submitted,
    },
    {
      key: 'in_progress',
      title: TAX_SUBMISSION_STAT_TITLES.inProgress,
      value: data.reports_in_progress,
      icon: Clock,
      variant: 'info',
      filterValue: TAX_SUBMISSION_FILTERS.inProgress,
    },
    {
      key: 'not_started',
      title: TAX_SUBMISSION_STAT_TITLES.notStarted,
      value: data.reports_not_started,
      icon: XCircle,
      variant: 'negative',
    },
    {
      key: 'completion',
      title: TAX_SUBMISSION_STAT_TITLES.completion,
      value: `${data.submission_percentage}%`,
      icon: TrendingUp,
      variant: 'purple',
    },
  ]

  if (totalRefundDue > 0) {
    stats.push({
      key: 'refund',
      title: TAX_SUBMISSION_STAT_TITLES.refund,
      value: formatShekelAmount(totalRefundDue),
      icon: Banknote,
      variant: 'positive',
    })
  }

  if (totalTaxDue > 0) {
    stats.push({
      key: 'tax_due',
      title: TAX_SUBMISSION_STAT_TITLES.taxDue,
      value: formatShekelAmount(totalTaxDue),
      icon: Banknote,
      variant: 'negative',
    })
  }

  return stats
}

export const getNextTaxSubmissionFilter = (currentFilter: string | undefined, selectedFilter: TaxSubmissionFilter) =>
  currentFilter === selectedFilter ? TAX_SUBMISSION_FILTERS.all : selectedFilter
