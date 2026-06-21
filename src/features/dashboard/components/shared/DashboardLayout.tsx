import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/utils'

type Tone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'purple'

const toneClasses: Record<Tone, { icon: string; badge: string; border: string }> = {
  neutral: { icon: 'bg-slate-100 text-slate-500', badge: 'bg-slate-100 text-slate-600', border: 'border-slate-200' },
  blue: {
    icon: 'bg-primary-50 text-primary-600',
    badge: 'bg-primary-50 text-primary-700',
    border: 'border-primary-100',
  },
  green: {
    icon: 'bg-positive-50 text-positive-600',
    badge: 'bg-positive-50 text-positive-700',
    border: 'border-positive-100',
  },
  amber: {
    icon: 'bg-warning-50 text-warning-600',
    badge: 'bg-warning-50 text-warning-700',
    border: 'border-warning-100',
  },
  red: {
    icon: 'bg-negative-50 text-negative-500',
    badge: 'bg-negative-50 text-negative-600',
    border: 'border-negative-100',
  },
  purple: { icon: 'bg-violet-50 text-violet-500', badge: 'bg-violet-50 text-violet-600', border: 'border-violet-100' },
}

interface DashboardSurfaceProps {
  children: ReactNode
  className?: string
}

export const DashboardSurface = ({ children, className }: DashboardSurfaceProps) => (
  <div className={cn('space-y-5', className)}>{children}</div>
)

interface DashboardSectionHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  count?: number | string
  action?: ReactNode
  tone?: Tone
  className?: string
}

export const DashboardSectionHeader = ({
  title,
  subtitle,
  icon: Icon,
  count,
  action,
  tone = 'neutral',
  className,
}: DashboardSectionHeaderProps) => (
  <div className={cn('flex items-center justify-between gap-4', className)}>
    <div className="flex min-w-0 items-center gap-3">
      {Icon && (
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl', toneClasses[tone].icon)}>
          <Icon className="h-4 w-4" />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="truncate text-sm font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 truncate text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {count !== undefined && (
        <span
          className={cn(
            'inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold tabular-nums',
            toneClasses[tone].badge,
          )}
        >
          {count}
        </span>
      )}
      {action}
    </div>
  </div>
)

interface DashboardPanelProps {
  children: ReactNode
  className?: string
}

export const DashboardPanel = ({ children, className }: DashboardPanelProps) => (
  <section className={cn('overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-elevation-1', className)}>
    {children}
  </section>
)

interface DashboardBadgeProps {
  children: ReactNode
  tone?: Tone
  strong?: boolean
  className?: string
}

export const DashboardBadge = ({ children, tone = 'neutral', strong, className }: DashboardBadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold',
      toneClasses[tone].badge,
      strong && toneClasses[tone].border,
      strong && 'border',
      className,
    )}
  >
    {children}
  </span>
)
