import { AlertTriangle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../utils/utils'

export type AlertBannerTone = 'warning' | 'negative'

const toneClasses: Record<AlertBannerTone, string> = {
  warning: 'border-warning-200 bg-warning-50 text-warning-800',
  negative: 'border-negative-200 bg-negative-50 text-negative-800',
}

interface AlertBannerProps {
  tone?: AlertBannerTone
  /** Replaces the default AlertTriangle while keeping the tone palette. */
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
}

/**
 * Flat inline alert banner (rounded-lg, tone-tinted background, leading icon).
 * Lower-emphasis sibling of the gradient `Alert`; used inside cards/headers where
 * a quiet warning/negative strip is wanted rather than a full-bleed alert.
 */
export const AlertBanner: React.FC<AlertBannerProps> = ({
  tone = 'warning',
  icon: Icon = AlertTriangle,
  children,
  className,
}) => (
  <div className={cn('flex items-start gap-2 rounded-lg border px-3 py-2 text-sm', toneClasses[tone], className)}>
    <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
    <span className="min-w-0 flex-1">{children}</span>
  </div>
)

AlertBanner.displayName = 'AlertBanner'
