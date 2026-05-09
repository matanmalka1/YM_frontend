import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { staggerAnimationDelayVars } from '../../../utils/animation'
import { DashboardMetricCard } from './DashboardPrimitives'

export interface StatItem {
  key: string
  title: string
  value: string | number
  description: string
  eyebrow?: string
  icon: LucideIcon
  variant: 'blue' | 'green' | 'red' | 'amber' | 'purple'
  urgent?: boolean
  href?: string
  progress?: number
  actionLabel?: string
}

interface DashboardStatsGridProps {
  stats: StatItem[]
}

/* ── Single stat card ───────────────────────────────────────────────────── */

interface StatCardProps {
  stat: StatItem
  index: number
}

const StatCard: React.FC<StatCardProps> = ({ stat, index }) => {
  const cardClass = cn(
    'group relative transition-all duration-200',
    'animate-fade-in h-full',
    stat.href && 'cursor-pointer',
  )

  const inner = (
    <div className="relative h-full">
      <DashboardMetricCard
        title={stat.title}
        value={stat.value}
        description={stat.description}
        eyebrow={stat.eyebrow}
        icon={stat.icon}
        tone={stat.variant}
        urgent={stat.urgent}
        progress={stat.progress}
        actionLabel={stat.actionLabel}
      />
    </div>
  )

  if (stat.href) {
    return (
      <Link
        to={stat.href}
        className={`${cardClass} [animation-delay:var(--enter-delay)]`}
        style={staggerAnimationDelayVars(index, 60)}
      >
        {inner}
      </Link>
    )
  }

  return (
    <div className={`${cardClass} [animation-delay:var(--enter-delay)]`} style={staggerAnimationDelayVars(index, 60)}>
      {inner}
    </div>
  )
}
StatCard.displayName = 'StatCard'

/* ── Grid ───────────────────────────────────────────────────────────────── */

export const DashboardStatsGrid = ({ stats }: DashboardStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat, index) => (
        <StatCard key={stat.key} stat={stat} index={index} />
      ))}
    </div>
  )
}

DashboardStatsGrid.displayName = 'DashboardStatsGrid'
