import type { LucideIcon } from 'lucide-react'
import { IconChip } from '@/components/ui/primitives/IconChip'
import { cn, formatCount } from '../../../utils/utils'
import { semanticStatToneClasses } from '@/utils/semanticColors'

type StatVariant = 'info' | 'positive' | 'negative' | 'warning' | 'purple' | 'neutral'

export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  variant?: StatVariant
  selected?: boolean
  onClick?: () => void
  className?: string
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
  }
> = {
  info: {
    ...semanticStatToneClasses.info,
  },
  positive: {
    ...semanticStatToneClasses.positive,
  },
  negative: {
    ...semanticStatToneClasses.negative,
  },
  warning: {
    ...semanticStatToneClasses.warning,
  },
  purple: {
    accent: 'bg-violet-500',
    border: 'border-r-2 border-r-violet-500',
    iconBg: 'bg-violet-50 text-violet-500',
    value: 'text-violet-700',
    strip: 'from-violet-500/10 to-transparent',
  },
  neutral: {
    ...semanticStatToneClasses.neutral,
  },
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  variant = 'neutral',
  selected = false,
  onClick,
  className,
  loading = false,
}) => {
  const config = STAT_VARIANTS[variant]
  const isInteractive = Boolean(onClick)

  const card = (
    <div
      className={cn(
        'relative h-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200',
        'px-5 py-4',
        isInteractive && 'hover:shadow-md',
        selected && 'ring-2 ring-primary-400 ring-offset-0',
        isInteractive && !selected && 'ring-1 ring-transparent',
        config.border,
        className,
      )}
    >
      <div className={cn('absolute bottom-0 right-0 top-0 w-0.5 rounded-r-xl', config.accent)} />

      <div className={cn('relative flex h-full min-w-0', 'flex-row-reverse items-start gap-4')}>
        {Icon && <IconChip icon={Icon} tone={variant} />}

        <div className="min-w-0 flex-1 text-right">
          <p className="mb-0.5 text-xs text-gray-500">{title}</p>

          <div>
            <div className={cn('text-lg font-bold leading-tight tabular-nums', config.value)}>
              {loading ? '—' : typeof value === 'number' ? formatCount(value) : value}
            </div>

            {description && <p className="mt-1 text-sm leading-relaxed text-gray-600">{description}</p>}
          </div>
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
