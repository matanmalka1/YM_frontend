import { cn } from '@/utils/utils'

type ChipTone = 'neutral' | 'primary' | 'warning' | 'orange' | 'purple' | 'rose'

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  tone?: ChipTone
  size?: 'xs' | 'sm'
  icon?: React.ReactNode
  count?: number
}

interface ChipLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone
  size?: 'xs' | 'sm'
}

const sizeClasses = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-3 py-1 text-xs',
}

const labelSizeClasses = {
  xs: 'px-1.5 py-0.5 text-2xs',
  sm: 'px-2 py-0.5 text-xs',
}

const selectedToneClasses: Record<ChipTone, string> = {
  neutral: 'border-gray-200 bg-gray-100 text-gray-600',
  primary: 'border-primary-300 bg-primary-100 text-primary-800 shadow-sm',
  warning: 'border-warning-300 bg-warning-100 text-warning-800 shadow-sm',
  orange: 'border-orange-200 bg-orange-50 text-orange-600',
  purple: 'border-purple-200 bg-purple-50 text-purple-600',
  rose: 'border-rose-200 bg-rose-50 text-rose-600',
}

const idleToneClasses: Record<ChipTone, string> = {
  neutral: 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100',
  primary: 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100',
  warning: 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100',
  orange: 'border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600',
  purple: 'border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600',
  rose: 'border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600',
}

const iconToneClasses: Record<ChipTone, { selected: string; idle: string }> = {
  neutral: { selected: 'text-gray-500', idle: 'text-gray-400' },
  primary: { selected: 'text-primary-600', idle: 'text-gray-400' },
  warning: { selected: 'fill-amber-500 text-warning-500', idle: 'text-gray-400' },
  orange: { selected: 'text-orange-500', idle: 'text-gray-400' },
  purple: { selected: 'text-purple-500', idle: 'text-gray-400' },
  rose: { selected: 'text-rose-500', idle: 'text-gray-400' },
}

export const Chip: React.FC<ChipProps> = ({
  selected = false,
  tone = 'neutral',
  size = 'sm',
  icon,
  count,
  children,
  className,
  ...props
}) => (
  <button
    type="button"
    className={cn(
      'focus-ring inline-flex items-center gap-1.5 rounded-full border font-medium transition-all duration-150',
      sizeClasses[size],
      selected ? selectedToneClasses[tone] : idleToneClasses[tone],
      className,
    )}
    aria-pressed={selected}
    {...props}
  >
    {icon && <span className={cn('inline-flex', iconToneClasses[tone][selected ? 'selected' : 'idle'])}>{icon}</span>}
    <span>{children}</span>
    {count !== undefined && count > 0 && (
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 text-3xs font-semibold leading-none',
          selected ? 'bg-white/50' : 'bg-gray-200 text-gray-600',
        )}
      >
        {count}
      </span>
    )}
  </button>
)

export const ChipLabel: React.FC<ChipLabelProps> = ({
  tone = 'neutral',
  size = 'sm',
  className,
  children,
  ...props
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded border font-semibold',
      labelSizeClasses[size],
      selectedToneClasses[tone],
      className,
    )}
    {...props}
  >
    {children}
  </span>
)
