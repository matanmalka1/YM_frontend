import type { LucideIcon } from 'lucide-react'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/utils/utils'

export type MetricCardTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'purple'

const toneClasses: Record<MetricCardTone, { icon: string; bar: string }> = {
  neutral: { icon: 'bg-slate-100 text-slate-500', bar: 'bg-slate-400' },
  blue: { icon: 'bg-primary-50 text-primary-600', bar: 'bg-primary-500' },
  green: { icon: 'bg-positive-50 text-positive-600', bar: 'bg-positive-500' },
  amber: { icon: 'bg-warning-50 text-warning-600', bar: 'bg-warning-400' },
  red: { icon: 'bg-negative-50 text-negative-500', bar: 'bg-negative-400' },
  purple: { icon: 'bg-violet-50 text-violet-500', bar: 'bg-violet-400' },
}

export interface MetricCardProps {
  title: string
  value: string | number
  description: string
  eyebrow?: string
  icon?: LucideIcon
  tone: MetricCardTone
  urgent?: boolean
  progress?: number
  actionLabel?: string
  className?: string
}

export const MetricCard = ({
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
}: MetricCardProps) => {
  const activeTone = urgent ? 'red' : tone
  const { icon: iconClass, bar: barClass } = toneClasses[activeTone]

  return (
    <div
      className={cn(
        'relative flex min-h-40 flex-col justify-between overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 text-right shadow-elevation-1 transition-all duration-200',
        'hover:shadow-elevation-2',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && <p className="mb-0.5 truncate text-[10px] font-semibold text-slate-400">{eyebrow}</p>}
          <h3 className="truncate text-sm font-medium text-slate-500">{title}</h3>
        </div>
        {Icon && (
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl', iconClass)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold tabular-nums text-slate-900">{value}</p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{description}</p>
      </div>

      <div className="space-y-1.5">
        {progress !== undefined && (
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn('h-full rounded-full', barClass)}
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
