import { Link } from 'react-router-dom'
import { ProgressBar, type ProgressTone } from '@/components/ui/primitives/ProgressBar'
import type { VatDashboardStats } from '../../api'
import { DASHBOARD_HREFS } from '../../constants'
import { useSeasonSummary } from '../../hooks/useSeasonSummary'
import { DashboardPanel } from '../shared/DashboardLayout'

interface Props {
  vatStats: VatDashboardStats
  embedded?: boolean
}

export const TaxInsightsRow: React.FC<Props> = ({ vatStats, embedded = false }) => {
  const { stats: seasonStats } = useSeasonSummary()
  const { monthly, bimonthly, advance_payments: advancePayments } = vatStats
  const insights = [
    {
      label: `מע״מ חודשי · ${monthly.period_label}`,
      percent: monthly.completion_percent,
      href: DASHBOARD_HREFS.vat(monthly.period, 'monthly'),
    },
    {
      label: `מע״מ דו-חודשי · ${bimonthly.period_label}`,
      percent: bimonthly.completion_percent,
      href: DASHBOARD_HREFS.vat(bimonthly.period, 'bimonthly'),
    },
    {
      label: `מקדמות חודשי · ${advancePayments.monthly.period_label}`,
      percent: advancePayments.monthly.completion_percent,
      href: DASHBOARD_HREFS.advancePayments(advancePayments.monthly.period.slice(0, 4), 1),
    },
    {
      label: `מקדמות דו-חודשי · ${advancePayments.bimonthly.period_label}`,
      percent: advancePayments.bimonthly.completion_percent,
      href: DASHBOARD_HREFS.advancePayments(advancePayments.bimonthly.period.slice(0, 4), 2),
    },
    ...(seasonStats && seasonStats.total > 0
      ? [{ label: `דוחות שנתיים ${seasonStats.taxYear}`, percent: seasonStats.completionPct, href: '/tax/reports' }]
      : []),
  ]

  const content = (
    <div className={embedded ? '' : 'p-5'}>
      <h3 className="mb-5 text-base font-bold text-slate-900">סטטוס הגשות</h3>
      <div className="space-y-5">
        {insights.map(({ label, percent, href }) => {
          const tone: ProgressTone = percent >= 80 ? 'positive' : percent >= 40 ? 'primary' : 'warning'
          return (
            <Link key={href} to={href} className="group block">
              <div className="mb-1.5 flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-700 transition-colors group-hover:text-primary-600">{label}</span>
                <span className="tabular-nums text-primary-600">{percent}%</span>
              </div>
              <ProgressBar value={percent} tone={tone} />
            </Link>
          )
        })}
      </div>
    </div>
  )

  if (embedded) return content

  return <DashboardPanel>{content}</DashboardPanel>
}

TaxInsightsRow.displayName = 'TaxInsightsRow'
