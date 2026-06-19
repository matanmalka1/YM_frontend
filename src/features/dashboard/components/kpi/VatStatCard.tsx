import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, formatCount } from '@/utils/utils'
import type { VatDashboardPeriodStat } from '../../api/contracts'

type StatTone = 'green' | 'amber' | 'red'

const toneClasses: Record<
  StatTone,
  { icon: string; chip: string; bar: string; pct: string }
> = {
  green: {
    icon: 'bg-positive-50 text-positive-600',
    chip: 'bg-positive-50 text-positive-700',
    bar: 'bg-positive-500',
    pct: 'text-positive-600',
  },
  amber: {
    icon: 'bg-warning-50 text-warning-600',
    chip: 'bg-warning-50 text-warning-700',
    bar: 'bg-warning-400',
    pct: 'text-warning-600',
  },
  red: {
    icon: 'bg-negative-50 text-negative-500',
    chip: 'bg-negative-50 text-negative-600',
    bar: 'bg-negative-400',
    pct: 'text-negative-600',
  },
}

const getTone = (stat: VatDashboardPeriodStat): StatTone => {
  if (stat.pending <= 0) return 'green'
  return stat.completion_percent >= 80 ? 'amber' : 'red'
}

interface VatStatCardProps {
  title: string
  unit: string
  icon: LucideIcon
  stat: VatDashboardPeriodStat
  href?: string
  className?: string
}

export const VatStatCard = ({ title, unit, icon: Icon, stat, href, className }: VatStatCardProps) => {
  const tone = getTone(stat)
  const { icon: iconClass, chip, bar, pct: pctClass } = toneClasses[tone]

  const content = (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-elevation-1 transition-all duration-200 hover:shadow-elevation-2',
        href && 'cursor-pointer',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl', iconClass)}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-slate-500">{title}</span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-bold tabular-nums text-4xl leading-none text-slate-900">
          {formatCount(stat.pending)}
        </span>
        <span className="text-xs font-medium text-slate-400">{unit}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">{stat.period_label}</span>
        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap', chip)}>
          {stat.status_label}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full transition-all duration-700', bar)}
          style={{ width: `${Math.min(stat.completion_percent, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
        <span className="tabular-nums">
          {formatCount(stat.submitted)} / {formatCount(stat.required)} הושלמו
        </span>
        <span className={cn('font-bold tabular-nums', pctClass)}>{stat.completion_percent}%</span>
      </div>
    </div>
  )

  if (href) return <Link to={href}>{content}</Link>
  return content
}

VatStatCard.displayName = 'VatStatCard'
