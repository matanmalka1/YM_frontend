import { cn } from '@/utils/utils'

export type ProgressTone = 'primary' | 'info' | 'positive' | 'warning' | 'negative' | 'neutral'

interface ProgressBarProps {
  /** Fill percentage 0–100 (clamped). */
  value: number
  /** Bar thickness: 'sm' = h-1.5, 'md' = h-2. */
  size?: 'sm' | 'md'
  /** Semantic fill+track palette. Overridden by fillClassName/trackClassName when set. */
  tone?: ProgressTone
  /** Fill color classes, e.g. 'bg-primary-500'. Overrides tone. */
  fillClassName?: string
  /** Track (background) color classes. Overrides tone. */
  trackClassName?: string
  /** Applied to the track wrapper (margins, flex-1, etc.). */
  className?: string
}

const sizes = { sm: 'h-1.5', md: 'h-2' } as const

const toneClasses: Record<ProgressTone, { fill: string; track: string }> = {
  primary: { fill: 'bg-primary-500', track: 'bg-gray-100' },
  info: { fill: 'bg-info-500', track: 'bg-info-50' },
  positive: { fill: 'bg-positive-500', track: 'bg-positive-50' },
  warning: { fill: 'bg-warning-500', track: 'bg-warning-50' },
  negative: { fill: 'bg-negative-500', track: 'bg-negative-50' },
  neutral: { fill: 'bg-gray-500', track: 'bg-gray-100' },
}

/**
 * Single-fill progress track. Width-driven, RTL-safe (fill starts at the
 * inline-start edge). For stacked/segmented bars, compose plain divs instead.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = 'md',
  tone,
  fillClassName,
  trackClassName,
  className,
}) => {
  const toneStyle = tone ? toneClasses[tone] : undefined
  const fill = fillClassName ?? toneStyle?.fill ?? 'bg-primary-500'
  const track = trackClassName ?? toneStyle?.track ?? 'bg-gray-100'
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('overflow-hidden rounded-full', sizes[size], track, className)}>
      <div className={cn('h-full rounded-full transition-all duration-700', fill)} style={{ width: `${pct}%` }} />
    </div>
  )
}

ProgressBar.displayName = 'ProgressBar'
