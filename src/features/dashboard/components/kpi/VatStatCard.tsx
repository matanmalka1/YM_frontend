import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, formatCount } from '@/utils/utils'
import { semanticStatToneClasses, type SemanticTone } from '@/utils/semanticColors'
import { Badge } from '@/components/ui/primitives/Badge'
import { Card } from '@/components/ui/primitives/Card'
import { ProgressBar } from '@/components/ui/primitives/ProgressBar'
import type { VatDashboardPeriodStat } from '../../api/contracts'

const getTone = (stat: VatDashboardPeriodStat): SemanticTone => {
  if (stat.pending <= 0) return 'positive'
  return stat.completion_percent >= 80 ? 'warning' : 'negative'
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
  const { iconBg, value: pctClass } = semanticStatToneClasses[tone]

  const content = (
    <Card
      variant="soft"
      size="compact"
      interactive={Boolean(href)}
      bodyClassName="flex flex-col gap-3"
      className={className}
    >
      <div className="flex items-center gap-3">
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl', iconBg)}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-slate-500">{title}</span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-bold tabular-nums text-4xl leading-none text-slate-900">{formatCount(stat.pending)}</span>
        <span className="text-xs font-medium text-slate-400">{unit}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">{stat.period_label}</span>
        <Badge variant={tone} size="2xs" className="whitespace-nowrap">
          {stat.status_label}
        </Badge>
      </div>

      <ProgressBar value={stat.completion_percent} size="sm" tone={tone} trackClassName="bg-slate-100" />

      <div className="flex items-center justify-between text-2xs font-medium text-slate-500">
        <span className="tabular-nums">
          {formatCount(stat.submitted)} / {formatCount(stat.required)} הושלמו
        </span>
        <span className={cn('font-bold tabular-nums', pctClass)}>{stat.completion_percent}%</span>
      </div>
    </Card>
  )

  if (href)
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    )
  return content
}

VatStatCard.displayName = 'VatStatCard'
