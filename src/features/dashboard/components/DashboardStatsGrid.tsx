import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { staggerAnimationDelayVars } from '@/utils/animation'
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

/** Shared layout so the grid and its loading skeleton stay column-aligned. */
export const DASHBOARD_STATS_GRID_CLASS = 'grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-5'

interface StatCardProps {
  stat: StatItem
  index: number
}

const StatCard = ({ stat, index }: StatCardProps) => {
  const card = (
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
  )

  if (stat.href) {
    return (
      <Link
        to={stat.href}
        className="animate-fade-in cursor-pointer [animation-delay:var(--enter-delay)]"
        style={staggerAnimationDelayVars(index)}
      >
        {card}
      </Link>
    )
  }

  return (
    <div className="animate-fade-in [animation-delay:var(--enter-delay)]" style={staggerAnimationDelayVars(index)}>
      {card}
    </div>
  )
}

export const DashboardStatsGrid = ({ stats }: DashboardStatsGridProps) => (
  <div className={DASHBOARD_STATS_GRID_CLASS}>
    {stats.map((stat, index) => (
      <StatCard key={stat.key} stat={stat} index={index} />
    ))}
  </div>
)

DashboardStatsGrid.displayName = 'DashboardStatsGrid'
