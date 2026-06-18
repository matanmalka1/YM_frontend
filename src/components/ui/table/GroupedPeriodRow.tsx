import { memo, useState } from 'react'
import { ChevronDown, ChevronLeft } from 'lucide-react'
import { Card } from '@/components/ui/primitives/Card'
import { cn } from '@/utils/utils'

type PeriodMetricTone = 'default' | 'success' | 'warning' | 'danger' | 'muted'

export interface PeriodSummaryMetric {
  label: string
  value: number | string
  tone?: PeriodMetricTone
}

interface GroupedPeriodRowProps {
  typeLabel: string
  primaryLabel: string
  secondaryLabel?: string | null
  relativeDueLabel?: string | null
  isCurrentPeriod?: boolean
  metrics: PeriodSummaryMetric[]
  ctaLabel: string
  closeLabel?: string
  isOpen?: boolean
  defaultOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  children: React.ReactNode
  className?: string
}

const metricToneClass: Record<PeriodMetricTone, string> = {
  default: 'text-gray-700',
  success: 'text-positive-700',
  warning: 'text-warning-700',
  danger: 'text-negative-700',
  muted: 'text-gray-500',
}

export const GroupedPeriodRow = memo(
  ({
    typeLabel,
    primaryLabel,
    secondaryLabel,
    relativeDueLabel,
    isCurrentPeriod = false,
    metrics,
    ctaLabel,
    closeLabel = 'סגור',
    isOpen,
    defaultOpen,
    onToggle,
    children,
    className,
  }: GroupedPeriodRowProps) => {
    const isControlled = isOpen !== undefined
    const [internalOpen, setInternalOpen] = useState(() => defaultOpen ?? isCurrentPeriod)
    const open = isControlled ? isOpen : internalOpen

    const toggle = () => {
      const nextOpen = !open
      if (!isControlled) setInternalOpen(nextOpen)
      onToggle?.(nextOpen)
    }

    return (
      <Card className={cn('overflow-hidden p-0 [&>div]:p-0', isCurrentPeriod && 'ring-1 ring-primary-300', className)}>
        <button
          type="button"
          dir="rtl"
          aria-expanded={open}
          onClick={toggle}
          className={cn(
            'grid min-h-[88px] w-full grid-cols-[minmax(180px,1fr)_minmax(120px,0.5fr)_minmax(420px,1.8fr)_auto] items-center gap-4 px-4 py-3 text-right',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset',
            isCurrentPeriod ? 'bg-primary-50/60 hover:bg-primary-50' : 'hover:bg-gray-50/60',
            'max-lg:grid-cols-1 max-lg:items-start max-lg:gap-3',
          )}
        >
          <span className="flex min-w-0 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{typeLabel}</span>
              {isCurrentPeriod && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                  חודש נוכחי
                </span>
              )}
            </span>
            <span className="truncate text-base font-bold text-gray-950">{primaryLabel}</span>
            {secondaryLabel && <span className="truncate text-xs font-medium text-gray-500">{secondaryLabel}</span>}
          </span>

          <span className="flex min-w-0 flex-col gap-0.5 text-sm">
            {relativeDueLabel && <span className="text-xs text-gray-500">{relativeDueLabel}</span>}
          </span>

          <span className="flex min-w-0 items-center gap-x-4 overflow-hidden max-lg:flex-wrap max-lg:gap-y-1.5">
            {metrics.map((metric) => (
              <span
                key={`${metric.label}-${metric.value}`}
                className="inline-flex shrink-0 items-baseline gap-1 text-sm"
              >
                <span className={cn('font-semibold tabular-nums', metricToneClass[metric.tone ?? 'default'])}>
                  {metric.value}
                </span>
                <span className="text-gray-500">{metric.label}</span>
              </span>
            ))}
          </span>

          <span className="mr-auto inline-flex items-center gap-2 text-sm font-semibold text-primary-700 max-lg:mr-0">
            <span>{open ? closeLabel : ctaLabel}</span>
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </span>
        </button>

        {open && <div className="border-t border-gray-100">{children}</div>}
      </Card>
    )
  },
)

GroupedPeriodRow.displayName = 'GroupedPeriodRow'
