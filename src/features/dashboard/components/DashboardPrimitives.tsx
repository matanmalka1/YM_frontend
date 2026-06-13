import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/utils/utils'

type Tone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'purple'

const toneClasses: Record<
  Tone,
  {
    icon: string
    badge: string
    border: string
    bar: string
    value: string
  }
> = {
  neutral: {
    icon: 'bg-slate-100 text-slate-500',
    badge: 'bg-slate-100 text-slate-600',
    border: 'border-slate-200',
    bar: 'bg-slate-400',
    value: 'text-slate-900',
  },
  blue: {
    icon: 'bg-primary-50 text-primary-600',
    badge: 'bg-primary-50 text-primary-700',
    border: 'border-primary-100',
    bar: 'bg-primary-500',
    value: 'text-slate-900',
  },
  green: {
    icon: 'bg-positive-50 text-positive-600',
    badge: 'bg-positive-50 text-positive-700',
    border: 'border-positive-100',
    bar: 'bg-positive-500',
    value: 'text-slate-900',
  },
  amber: {
    icon: 'bg-warning-50 text-warning-600',
    badge: 'bg-warning-50 text-warning-700',
    border: 'border-warning-100',
    bar: 'bg-warning-400',
    value: 'text-slate-900',
  },
  red: {
    icon: 'bg-negative-50 text-negative-500',
    badge: 'bg-negative-50 text-negative-600',
    border: 'border-negative-100',
    bar: 'bg-negative-400',
    value: 'text-slate-900',
  },
  purple: {
    icon: 'bg-violet-50 text-violet-500',
    badge: 'bg-violet-50 text-violet-600',
    border: 'border-violet-100',
    bar: 'bg-violet-400',
    value: 'text-slate-900',
  },
}

interface DashboardSurfaceProps {
  children: ReactNode
  className?: string
}

export const DashboardSurface = ({ children, className }: DashboardSurfaceProps) => (
  <div dir="rtl" className={cn('space-y-5', className)}>
    {children}
  </div>
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

interface DashboardMetricCardProps {
  title: string
  value: string | number
  description: string
  eyebrow?: string
  icon?: LucideIcon
  tone: Tone
  urgent?: boolean
  progress?: number
  actionLabel?: string
  className?: string
}

export const DashboardMetricCard = ({
  title,
  value,
  description,
  eyebrow,
  icon: Icon,
  tone,
  urgent,
  progress,
  actionLabel,
  className,
}: DashboardMetricCardProps) => {
  const activeTone = urgent ? 'red' : tone
  return (
    <div
      className={cn(
        'relative flex h-40 flex-col justify-between overflow-hidden rounded-3xl border bg-white p-5 text-right shadow-elevation-1 transition-all duration-200',
        'hover:shadow-elevation-2',
        'border-slate-100',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && <p className="mb-0.5 truncate text-[10px] font-semibold text-slate-400">{eyebrow}</p>}
          <h3 className="truncate text-sm font-medium text-slate-500">{title}</h3>
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl',
              toneClasses[activeTone].icon,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div>
        <p className={cn('text-2xl font-bold tabular-nums', toneClasses[activeTone].value)}>{value}</p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{description}</p>
      </div>

      <div className="space-y-1.5">
        {progress !== undefined && (
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn('h-full rounded-full', toneClasses[activeTone].bar)}
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        )}
        {actionLabel && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-bold hover:underline',
              urgent ? 'text-negative-600' : 'text-primary-600',
            )}
          >
            {actionLabel}
            <ChevronLeft className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  )
}

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
