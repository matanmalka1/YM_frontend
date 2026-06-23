import React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { semanticBadgeClasses, semanticSignalBadgeClasses } from '@/utils/semanticColors'

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'purple'
export type BadgeSize = '3xs' | '2xs' | 'xs' | 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  /** Dot color class for signal-style badges (e.g. "bg-negative-500") */
  dot?: string
  /** Adds ring-1 for signal-style appearance */
  ring?: boolean
  /** Shows X remove button (active-filter pill mode) */
  removable?: boolean
  onRemove?: () => void
  /** Accessible label for the remove button (default: "הסר סינון") */
  removeLabel?: string
  onClick?: React.MouseEventHandler<HTMLSpanElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLSpanElement>
  className?: string
  suppressHydrationWarning?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  success: semanticBadgeClasses.positive,
  warning: semanticBadgeClasses.warning,
  error: semanticBadgeClasses.negative,
  info: semanticBadgeClasses.info,
  neutral: semanticBadgeClasses.neutral,
  primary: 'bg-primary-600 text-white',
  purple: 'bg-purple-100 text-purple-700',
}

const signalVariantClasses: Record<BadgeVariant, string> = {
  warning: semanticSignalBadgeClasses.warning,
  info: semanticSignalBadgeClasses.info,
  neutral: semanticSignalBadgeClasses.neutral,
  success: semanticSignalBadgeClasses.positive,
  error: semanticSignalBadgeClasses.negative,
  primary: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
}

const softSignalVariantClasses: Record<BadgeVariant, string> = {
  warning: 'bg-warning-50 text-warning-700',
  info: 'bg-info-50 text-info-700',
  neutral: 'bg-gray-50 text-gray-600',
  success: 'bg-positive-50 text-positive-700',
  error: 'bg-negative-50 text-negative-700',
  primary: 'bg-primary-50 text-primary-700',
  purple: 'bg-purple-50 text-purple-700',
}

const sizeClasses: Record<BadgeSize, string> = {
  '3xs': 'px-1 py-0 text-3xs',
  '2xs': 'px-2 py-0.5 text-2xs',
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

const signalSizeClasses: Record<BadgeSize, string> = {
  '3xs': 'gap-1 px-1 py-0 text-3xs',
  '2xs': 'gap-1 px-2 py-0.5 text-2xs',
  xs: 'gap-1 px-1.5 py-0.5 text-xs',
  sm: 'gap-1 px-1.5 py-0.5 text-xs',
  md: 'gap-1.5 px-2.5 py-1 text-sm',
}

const dotSizeClasses: Record<BadgeSize, string> = {
  '3xs': 'h-1.5 w-1.5',
  '2xs': 'h-1.5 w-1.5',
  xs: 'h-1.5 w-1.5',
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
}

const removableSizeClasses: Record<BadgeSize, string> = {
  '3xs': 'gap-1 py-0 pe-1 ps-1 text-3xs',
  '2xs': 'gap-1 py-0.5 pe-2 ps-1 text-2xs',
  xs: 'gap-1 py-0.5 pe-2 ps-1 text-xs',
  sm: 'gap-1.5 py-0.5 pe-2.5 ps-1.5 text-xs',
  md: 'gap-2 py-1 pe-3 ps-2 text-sm',
}

const removeButtonSizeClasses: Record<BadgeSize, string> = {
  '3xs': 'h-3.5 w-3.5',
  '2xs': 'h-3.5 w-3.5',
  xs: 'h-3.5 w-3.5',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot,
  ring,
  removable,
  onRemove,
  removeLabel = 'הסר סינון',
  onClick,
  onKeyDown,
  className,
  suppressHydrationWarning,
}) => {
  if (removable) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border border-primary-200 bg-primary-50 font-medium text-primary-800',
          removableSizeClasses[size],
          className,
        )}
      >
        {children}
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            'flex items-center justify-center rounded-full hover:bg-primary-200 transition-colors',
            removeButtonSizeClasses[size],
          )}
          aria-label={removeLabel}
        >
          <X className="h-3 w-3" />
        </button>
      </span>
    )
  }

  if (dot !== undefined || ring) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          signalSizeClasses[size],
          ring ? signalVariantClasses[variant] : softSignalVariantClasses[variant],
          className,
        )}
      >
        <span className={cn('rounded-full shrink-0', dotSizeClasses[size], dot ?? 'bg-gray-400')} />
        {children}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        variantClasses[variant],
        onClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        className,
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      suppressHydrationWarning={suppressHydrationWarning}
    >
      {children}
    </span>
  )
}

Badge.displayName = 'Badge'
