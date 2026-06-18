import { Link } from 'react-router-dom'
import { cn } from '@/utils/utils'
import type { VatDashboardStats } from '../api'
import { DASHBOARD_HREFS } from '../dashboardConstants'
import { useSeasonSummary } from '../hooks/useSeasonSummary'
import { DashboardPanel } from './DashboardLayout'

interface Props {
  vatStats: VatDashboardStats
  embedded?: boolean
}

interface ProgressBarProps {
  label: string
  percent: number
  href?: string
}

const ProgressBar = ({ label, percent, href }: ProgressBarProps) => {
  const color = percent >= 80 ? 'bg-positive-500' : percent >= 40 ? 'bg-primary-500' : 'bg-warning-400'

  const content = (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between text-sm font-semibold">
        <span className={cn('text-slate-700', href && 'transition-colors group-hover:text-primary-600')}>{label}</span>
        <span className="tabular-nums text-primary-600">{percent}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  )

  if (href) return <Link to={href}>{content}</Link>
  return content
}

export const TaxInsightsRow: React.FC<Props> = ({ vatStats, embedded = false }) => {
  const { stats: seasonStats } = useSeasonSummary()
  const { monthly, bimonthly, advance_payments: advancePayments } = vatStats

  const content = (
    <div className={embedded ? '' : 'p-5'}>
      <h3 className="mb-5 text-base font-bold text-slate-900">סטטוס הגשות</h3>
      <div className="space-y-5">
        <ProgressBar
          label={`מע״מ חודשי · ${monthly.period_label}`}
          percent={monthly.completion_percent}
          href={DASHBOARD_HREFS.vat(monthly.period, 'monthly')}
        />
        <ProgressBar
          label={`מע״מ דו-חודשי · ${bimonthly.period_label}`}
          percent={bimonthly.completion_percent}
          href={DASHBOARD_HREFS.vat(bimonthly.period, 'bimonthly')}
        />
        <ProgressBar
          label={`מקדמות חודשי · ${advancePayments.monthly.period_label}`}
          percent={advancePayments.monthly.completion_percent}
          href={DASHBOARD_HREFS.advancePayments(advancePayments.monthly.period.slice(0, 4), 1)}
        />
        <ProgressBar
          label={`מקדמות דו-חודשי · ${advancePayments.bimonthly.period_label}`}
          percent={advancePayments.bimonthly.completion_percent}
          href={DASHBOARD_HREFS.advancePayments(advancePayments.bimonthly.period.slice(0, 4), 2)}
        />
        {seasonStats && seasonStats.total > 0 && (
          <ProgressBar
            label={`דוחות שנתיים ${seasonStats.taxYear}`}
            percent={seasonStats.completionPct}
            href="/tax/reports"
          />
        )}
      </div>
    </div>
  )

  if (embedded) return content

  return <DashboardPanel>{content}</DashboardPanel>
}

TaxInsightsRow.displayName = 'TaxInsightsRow'
