import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { semanticStatToneClasses } from '@/utils/semanticColors'

type StatVariant = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'neutral'

export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  eyebrow?: string
  icon?: LucideIcon
  variant?: StatVariant
  trend?: {
    value: number
    label: string
  }
  progress?: number
  selected?: boolean
  onClick?: () => void
  className?: string
  actionLabel?: string
  compact?: boolean
  /** Show a placeholder instead of value while the backing query is loading. */
  loading?: boolean
}

const STAT_VARIANTS: Record<
  StatVariant,
  {
    accent: string
    border: string
    iconBg: string
    value: string
    strip: string
    progress: string
    progressTrack: string
  }
> = {
  blue: {
    ...semanticStatToneClasses.info,
    progress: 'bg-info-500',
    progressTrack: 'bg-info-50',
  },
  green: {
    ...semanticStatToneClasses.positive,
    progress: 'bg-positive-500',
    progressTrack: 'bg-positive-50',
  },
  red: {
    ...semanticStatToneClasses.negative,
    progress: 'bg-negative-500',
    progressTrack: 'bg-negative-50',
  },
  orange: {
    ...semanticStatToneClasses.warning,
    progress: 'bg-warning-500',
    progressTrack: 'bg-warning-50',
  },
  purple: {
    accent: 'bg-violet-500',
    border: 'border-r-2 border-r-violet-500',
    iconBg: 'bg-violet-50 text-violet-500',
    value: 'text-violet-700',
    strip: 'from-violet-500/10 to-transparent',
    progress: 'bg-violet-500',
    progressTrack: 'bg-violet-50',
  },
  neutral: {
    ...semanticStatToneClasses.neutral,
    progress: 'bg-gray-500',
    progressTrack: 'bg-gray-100',
  },
}

const clampProgress = (value: number) => Math.min(Math.max(value, 0), 100)

const formatTrend = (value: number) => {
  if (value > 0) return { icon: '↑', className: 'bg-positive-100 text-positive-700' }
  if (value < 0) return { icon: '↓', className: 'bg-negative-100 text-negative-700' }

  return { icon: '→', className: 'bg-gray-100 text-gray-700' }
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  eyebrow,
  icon: Icon,
  variant = 'neutral',
  trend,
  progress,
  selected = false,
  onClick,
  className,
  actionLabel,
  compact = false,
  loading = false,
}) => {
  const [displayValue, setDisplayValue] = useState(() => (typeof value === 'number' ? 0 : null))
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (loading) {
      return
    }

    if (typeof value !== 'number' || Number.isNaN(value)) {
      setDisplayValue(null)
      return
    }

    const durationMs = 900
    const startValue = 0
    const endValue = value
    const startedAt = performance.now()

    const animate = (now: number) => {
      const elapsedRatio = Math.min((now - startedAt) / durationMs, 1)
      const easedRatio = 1 - Math.pow(1 - elapsedRatio, 3)
      const nextValue = Math.round(startValue + (endValue - startValue) * easedRatio)

      setDisplayValue(nextValue)

      if (elapsedRatio < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [value, loading])

  const config = STAT_VARIANTS[variant]
  const isInteractive = Boolean(onClick)
  const trendConfig = trend ? formatTrend(trend.value) : null

  const card = (
    <div
      className={cn(
        'relative h-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200',
        compact ? 'min-h-[150px] px-4 py-3' : 'px-5 py-4',
        isInteractive && 'hover:shadow-md',
        selected && 'ring-2 ring-primary-400 ring-offset-0',
        isInteractive && !selected && 'ring-1 ring-transparent',
        config.border,
        className,
      )}
    >
      <div className={cn('absolute bottom-0 right-0 top-0 w-0.5 rounded-r-xl', config.accent)} />

      <div
        className={cn(
          'relative flex h-full min-w-0',
          compact ? 'flex-col justify-between gap-2' : 'flex-row-reverse items-start gap-4',
        )}
      >
        {Icon && (
          <div
            className={cn(
              'flex shrink-0 items-center justify-center rounded-lg',
              compact ? 'absolute left-0 top-0 h-8 w-8' : 'h-10 w-10',
              config.iconBg,
            )}
          >
            <Icon className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
          </div>
        )}

        <div className={cn('min-w-0 flex-1 text-right', compact && 'flex flex-col justify-between')}>
          <p className={cn('text-xs text-gray-500', compact ? 'mb-2 pl-9' : 'mb-0.5')}>{title}</p>

          {eyebrow && <p className="mb-1 text-xs font-medium text-gray-500">{eyebrow}</p>}

          <div>
            <div className={cn('font-bold leading-tight tabular-nums', compact ? 'text-xl' : 'text-lg', config.value)}>
              {loading
                ? '—'
                : typeof value === 'number'
                  ? (displayValue ?? value).toLocaleString('he-IL')
                  : value}
            </div>

            {description && (
              <p className={cn('mt-1 text-gray-600', compact ? 'text-xs leading-snug' : 'text-sm leading-relaxed')}>
                {description}
              </p>
            )}
          </div>

          {progress !== undefined && (
            <div className={cn('mt-3 h-2 w-full rounded-full', config.progressTrack)}>
              <div
                className={cn('h-2 rounded-full transition-all duration-700', config.progress)}
                style={{ width: `${clampProgress(progress)}%` }}
              />
            </div>
          )}

          {trend && trendConfig && (
            <div className="mt-3 flex flex-row-reverse items-center gap-2 text-sm">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                  trendConfig.className,
                )}
              >
                {trendConfig.icon} {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-gray-500">{trend.label}</span>
            </div>
          )}

          {actionLabel && (
            <p className={cn('text-xs font-medium text-gray-500', compact ? 'mt-2' : 'mt-3')}>{actionLabel}</p>
          )}
        </div>
      </div>
    </div>
  )

  if (!isInteractive) {
    return card
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="w-full text-right transition-transform hover:scale-[1.01]"
    >
      {card}
    </button>
  )
}
