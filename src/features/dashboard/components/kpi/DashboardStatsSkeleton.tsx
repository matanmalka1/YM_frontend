import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { staggerDelay } from '@/utils/animation'

export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: 4 }, (_, index) => (
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
