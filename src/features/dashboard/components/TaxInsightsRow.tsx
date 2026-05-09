import { Link } from 'react-router-dom'
import { cn } from '@/utils/utils'
import type { VatDashboardStats } from '../api'
import { useSeasonSummary } from '../hooks/useSeasonSummary'
import { DashboardPanel } from './DashboardPrimitives'

interface Props {
  vatStats: VatDashboardStats
}

interface ProgressBarProps {
  label: string
  percent: number
  href?: string
}

const ProgressBar = ({ label, percent, href }: ProgressBarProps) => {
  const color = percent >= 80 ? 'bg-green-500' : percent >= 40 ? 'bg-blue-500' : 'bg-amber-400'

  const content = (
    <div className="group">
      <div className="mb-1 flex items-center justify-between text-xs font-semibold">
        <span className={cn('text-gray-700', href && 'transition-colors group-hover:text-primary')}>{label}</span>
        <span className="tabular-nums text-primary">{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
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

export const TaxInsightsRow: React.FC<Props> = ({ vatStats }) => {
  const { stats: seasonStats } = useSeasonSummary()
  const { monthly, bimonthly, advance_payments: advancePayments } = vatStats
  const vatHref = (period: string, type: string) => `/tax/vat?period=${period}&period_type=${type}`
  const advanceHref = (year: string, periodMonthsCount: 1 | 2) =>
    `/tax/advance-payments?year=${year}&period=${periodMonthsCount}`

  return (
    <DashboardPanel>
      <div className="p-4">
        <h3 className="mb-4 text-sm font-bold text-gray-900">סטטוס הגשות</h3>
        <div className="space-y-4">
          <ProgressBar
            label={`מע״מ חודשי · ${monthly.period_label}`}
            percent={monthly.completion_percent}
            href={vatHref(monthly.period, 'monthly')}
          />
          <ProgressBar
            label={`מע״מ דו-חודשי · ${bimonthly.period_label}`}
            percent={bimonthly.completion_percent}
            href={vatHref(bimonthly.period, 'bimonthly')}
          />
          <ProgressBar
            label={`מקדמות חודשי · ${advancePayments.monthly.period_label}`}
            percent={advancePayments.monthly.completion_percent}
            href={advanceHref(advancePayments.monthly.period.slice(0, 4), 1)}
          />
          <ProgressBar
            label={`מקדמות דו-חודשי · ${advancePayments.bimonthly.period_label}`}
            percent={advancePayments.bimonthly.completion_percent}
            href={advanceHref(advancePayments.bimonthly.period.slice(0, 4), 2)}
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
    </DashboardPanel>
  )
}

TaxInsightsRow.displayName = 'TaxInsightsRow'
