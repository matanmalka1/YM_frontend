import { useEffect, useState } from 'react'
import { cn } from '../../../utils/utils'
import type { LucideIcon } from 'lucide-react'
import { semanticStatToneClasses } from '@/utils/semanticColors'

export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  eyebrow?: string
  icon?: LucideIcon
  variant?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'neutral'
  trend?: {
    value: number
    label: string
  }
  /** When provided, renders a progress bar below the value (0–100). */
  progress?: number
  selected?: boolean
  onClick?: () => void
  className?: string
  actionLabel?: string
  compact?: boolean
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
  selected,
  onClick,
  className,
  actionLabel,
  compact = false,
}) => {
  const [displayValue, setDisplayValue] = useState(0)

  // Animated counter effect (handles negative values)
  useEffect(() => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return
    }

    const duration = 900
    const from = 0
    const to = value
    const start = performance.now()

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      const current = Math.round(from + (to - from) * eased)
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    const frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [value])

  const variants = {
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

  const config = variants[variant]
  const isInteractive = !!onClick

  const card = (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 h-full',
        compact ? 'min-h-[150px] px-4 py-3' : 'px-5 py-4',
        'hover:shadow-md',
        selected && 'ring-2 ring-primary-300 ring-offset-2',
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
              {typeof value === 'number' ? displayValue.toLocaleString('he-IL') : value}
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
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
          )}

          {trend && (
            <div className="mt-3 flex flex-row-reverse items-center gap-2 text-sm">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                  trend.value > 0 ? 'bg-positive-100 text-positive-700' : 'bg-negative-100 text-negative-700',
                )}
              >
                {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
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

  return isInteractive ? (
    <button type="button" onClick={onClick} className="w-full text-right transition-transform hover:scale-[1.01]">
      {card}
    </button>
  ) : (
    card
  )
}
