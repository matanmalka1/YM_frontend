import { cn } from '@/utils/utils'

interface ProgressBarProps {
  /** Fill percentage 0–100 (clamped). */
  value: number
  /** Bar thickness: 'sm' = h-1.5, 'md' = h-2. */
  size?: 'sm' | 'md'
  /** Fill color classes, e.g. 'bg-primary-500'. */
  fillClassName?: string
  /** Track (background) color classes. */
  trackClassName?: string
  /** Applied to the track wrapper (margins, flex-1, etc.). */
  className?: string
}

const sizes = { sm: 'h-1.5', md: 'h-2' } as const

/**
 * Single-fill progress track. Width-driven, RTL-safe (fill starts at the
 * inline-start edge). For stacked/segmented bars, compose plain divs instead.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = 'md',
  fillClassName = 'bg-primary-500',
  trackClassName = 'bg-gray-100',
  className,
}) => {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('overflow-hidden rounded-full', sizes[size], trackClassName, className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-700', fillClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

ProgressBar.displayName = 'ProgressBar'
