import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, formatCount } from '@/utils/utils'
import { semanticStatToneClasses, type SemanticTone } from '@/utils/semanticColors'
import { Badge } from '@/components/ui/primitives/Badge'
import { Card } from '@/components/ui/primitives/Card'
import { IconChip } from '@/components/ui/primitives/IconChip'
import { ProgressBar } from '@/components/ui/primitives/ProgressBar'
import type { VatDashboardPeriodStat } from '../../api/contracts'
import { DASHBOARD_MESSAGES } from '../../messages'

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
  const { value: pctClass } = semanticStatToneClasses[tone]

  const content = (
    <Card variant="soft" size="compact" interactive={Boolean(href)} bodyClassName="flex flex-col gap-3.5" className={className}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <IconChip icon={Icon} tone={tone} />
          <span className="text-sm font-semibold text-slate-500">{title}</span>
        </div>
        <Badge variant={tone} size="2xs" className="whitespace-nowrap">
          {stat.status_label}
        </Badge>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold tabular-nums text-4xl leading-none tracking-tight text-slate-900">
            {formatCount(stat.pending)}
          </span>
          <span className="text-xs font-medium text-slate-400">{unit}</span>
        </div>
        <span className="text-xs text-slate-500">{stat.period_label}</span>
      </div>

      <div className="space-y-1.5 pt-1">
        <ProgressBar value={stat.completion_percent} size="sm" tone={tone} trackClassName="bg-slate-100" />

        <div className="flex items-center justify-between text-2xs font-medium text-slate-500">
          <span className="tabular-nums">
            {formatCount(stat.submitted)} / {formatCount(stat.required)} {DASHBOARD_MESSAGES.stats.completed}
          </span>
          <span className={cn('font-bold tabular-nums', pctClass)}>{stat.completion_percent}%</span>
        </div>
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
