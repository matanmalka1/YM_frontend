import React from 'react'
import { cn } from '../../../utils/utils'
import { semanticBadgeClasses, semanticSignalBadgeClasses } from '@/utils/semanticColors'

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'
export type BadgeSize = 'xs' | 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  /** Dot color class for signal-style badges (e.g. "bg-negative-500") */
  dot?: string
  /** Adds ring-1 for signal-style appearance */
  ring?: boolean
  /** Shows × remove button (active-filter pill mode) */
  removable?: boolean
  onRemove?: () => void
  onClick?: React.MouseEventHandler<HTMLSpanElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLSpanElement>
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: semanticBadgeClasses.positive,
  warning: semanticBadgeClasses.warning,
  error: semanticBadgeClasses.negative,
  info: semanticBadgeClasses.info,
  neutral: semanticBadgeClasses.neutral,
}

const signalVariantClasses: Record<BadgeVariant, string> = {
  warning: semanticSignalBadgeClasses.warning,
  info: semanticSignalBadgeClasses.info,
  neutral: semanticSignalBadgeClasses.neutral,
  success: semanticSignalBadgeClasses.positive,
  error: semanticSignalBadgeClasses.negative,
}

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

const signalSizeClasses: Record<BadgeSize, string> = {
  xs: 'gap-1 px-1.5 py-0.5 text-xs',
  sm: 'gap-1 px-1.5 py-0.5 text-xs',
  md: 'gap-1.5 px-2.5 py-1 text-sm',
}

const dotSizeClasses: Record<BadgeSize, string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
}

const removableSizeClasses: Record<BadgeSize, string> = {
  xs: 'gap-1 py-0.5 pe-2 ps-1 text-xs',
  sm: 'gap-1.5 py-0.5 pe-2.5 ps-1.5 text-xs',
  md: 'gap-2 py-1 pe-3 ps-2 text-sm',
}

const removeButtonSizeClasses: Record<BadgeSize, string> = {
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
  onClick,
  onKeyDown,
  className,
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
          aria-label={`הסר סינון`}
        >
          ×
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
          signalVariantClasses[variant],
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
        'rounded-full font-medium',
        sizeClasses[size],
        variantClasses[variant],
        onClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        className,
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </span>
  )
}

Badge.displayName = 'Badge'
