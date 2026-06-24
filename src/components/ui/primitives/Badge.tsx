import React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../../utils/utils'
import {
  badgeVariantClasses,
  badgeSignalVariantClasses,
  badgeSoftSignalVariantClasses,
  type BadgeVariant,
} from '@/utils/semanticColors'

export type { BadgeVariant }
export type BadgeSize = '3xs' | '2xs' | 'xs' | 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  /** Decorative icon rendered before the badge label. */
  icon?: React.ReactNode
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
  icon,
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
        {icon && (
          <span aria-hidden="true" className="shrink-0">
            {icon}
          </span>
        )}
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
          ring ? badgeSignalVariantClasses[variant] : badgeSoftSignalVariantClasses[variant],
          className,
        )}
      >
        <span className={cn('rounded-full shrink-0', dotSizeClasses[size], dot ?? 'bg-gray-400')} />
        {icon && (
          <span aria-hidden="true" className="shrink-0">
            {icon}
          </span>
        )}
        {children}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        icon && 'gap-1',
        badgeVariantClasses[variant],
        onClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        className,
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      suppressHydrationWarning={suppressHydrationWarning}
    >
      {icon && (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      )}
      {children}
    </span>
  )
}

Badge.displayName = 'Badge'
