import { Building2, CalendarDays, CalendarRange, User } from 'lucide-react'
import type { ElementType } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/utils'
import type { VatDashboardStats } from '../api'
import { useSeasonSummary } from '../hooks/useSeasonSummary'
import { DashboardPanel } from './DashboardPrimitives'

const SEGMENT_ICONS: Record<string, ElementType> = {
  'עוסק מורשה חודשי': CalendarDays,
  'עוסק מורשה דו-חודשי': CalendarRange,
  'חברה בע״מ חודשי': Building2,
  'חברה בע״מ דו-חודשי': Building2,
  'עוסק פטור': User,
}

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
  const { monthly, bimonthly, advance_payments: advancePayments, segmentation } = vatStats
  const vatHref = (period: string, type: string) => `/tax/vat?period=${period}&period_type=${type}`
  const advanceHref = (year: string, periodMonthsCount: 1 | 2) =>
    `/tax/advance-payments?year=${year}&period=${periodMonthsCount}`

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* פילוח מע״מ */}
      <DashboardPanel>
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">פילוח מע״מ</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] uppercase tracking-wider text-gray-500">
              מעודכן להיום
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {segmentation.map((seg) => {
              const Icon = SEGMENT_ICONS[seg.label] ?? User
              return (
                <div key={seg.label} className="rounded-xl border border-transparent bg-gray-100 p-3">
                  <div className="mb-1 flex items-start justify-between gap-1">
                    <p className="text-xs text-gray-500">{seg.label}</p>
                    {seg.label === 'עוסק פטור' && (
                      <span className="shrink-0 rounded px-1 py-0.5 text-[9px] font-bold bg-gray-200 text-gray-500">
                        ללא דיווח
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold tabular-nums text-primary">{seg.count}</span>
                    <Icon className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DashboardPanel>

      {/* סטטוס הגשות */}
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
    </div>
  )
}

TaxInsightsRow.displayName = 'TaxInsightsRow'
