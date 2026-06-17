import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { staggerDelay } from '@/utils/animation'
import { DASHBOARD_LOADING_CARD_COUNT } from '../dashboardConstants'
import { DASHBOARD_STATS_GRID_CLASS } from './DashboardStatsGrid'

export const DashboardStatsSkeleton = () => (
  <div className={DASHBOARD_STATS_GRID_CLASS}>
    {Array.from({ length: DASHBOARD_LOADING_CARD_COUNT }, (_, index) => (
      <SkeletonBlock
        key={index}
        height="h-40"
        width="w-full"
        shimmer
        delay={staggerDelay(index, 80)}
        className="rounded-3xl"
      />
    ))}
  </div>
)

DashboardStatsSkeleton.displayName = 'DashboardStatsSkeleton'
