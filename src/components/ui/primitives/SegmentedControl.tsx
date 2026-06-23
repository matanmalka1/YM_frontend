import { cn } from '@/utils/utils'

type SegmentedControlVariant = 'underline' | 'tabBar' | 'boxed' | 'choice' | 'vertical' | 'switch'

interface SegmentedControlProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SegmentedControlVariant
}

interface SegmentedControlItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean
  variant?: SegmentedControlVariant
  icon?: React.ReactNode
  badge?: React.ReactNode
  trailing?: React.ReactNode
}

const controlClasses: Record<SegmentedControlVariant, string> = {
  underline: 'flex flex-wrap items-center gap-1 border-b border-gray-200',
  tabBar: 'flex gap-1 border-b border-gray-200 bg-white/95 px-1 backdrop-blur-sm',
  boxed: 'flex overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm',
  choice: 'flex flex-wrap gap-2',
  vertical: 'flex min-w-20 flex-col gap-1',
  switch: 'grid grid-flow-col auto-cols-fr gap-1 rounded-xl bg-gray-100 p-1',
}

const itemBaseClasses: Record<SegmentedControlVariant, string> = {
  underline: 'relative shrink-0 rounded-t-md px-4 py-2 text-sm font-medium transition-colors',
  tabBar: 'inline-flex items-center gap-2 rounded-t-lg border-b-2 px-5 py-3 text-sm font-medium transition-colors',
  boxed:
    'flex items-center gap-2 px-5 py-3 text-sm whitespace-nowrap transition-colors first:rounded-r-xl last:rounded-l-xl',
  choice: 'rounded-lg border px-3.5 py-2 text-sm font-medium transition-all',
  vertical: 'rounded-lg px-3 py-2 text-right text-sm font-medium transition-all',
  switch: 'h-8 rounded-nav text-xs font-medium transition',
}

const itemStateClasses: Record<SegmentedControlVariant, { selected: string; idle: string }> = {
  underline: {
    selected: 'bg-white text-primary',
    idle: 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
  },
  tabBar: {
    selected: 'border-primary-600 bg-primary-50 text-primary-800 shadow-sm',
    idle: 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800',
  },
  boxed: {
    selected: 'bg-primary-50 text-primary-700',
    idle: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
  },
  choice: {
    selected: 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200',
    idle: 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50/40 hover:text-primary-700',
  },
  vertical: {
    selected: 'border border-primary-200 bg-primary-50 text-primary-700 ring-1 ring-primary-100',
    idle: 'text-gray-600 hover:bg-gray-100',
  },
  switch: {
    selected: 'bg-white text-gray-950 shadow-sm',
    idle: 'text-gray-500 hover:bg-white/70 hover:text-gray-800',
  },
}

const badgeClasses: Partial<Record<SegmentedControlVariant, string>> = {
  tabBar:
    'min-w-[1.35rem] rounded-full bg-gray-100 px-1.5 py-0.5 text-center text-xs font-medium tabular-nums text-gray-700',
}

const selectedBadgeClasses: Partial<Record<SegmentedControlVariant, string>> = {
  tabBar: 'bg-white text-primary-800 ring-1 ring-primary-200',
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  variant = 'choice',
  className,
  role = 'group',
  ...props
}) => <div role={role} className={cn(controlClasses[variant], className)} {...props} />

export const SegmentedControlItem: React.FC<SegmentedControlItemProps> = ({
  selected,
  variant = 'choice',
  icon,
  badge,
  trailing,
  children,
  className,
  'aria-pressed': ariaPressed,
  ...props
}) => (
  <button
    type="button"
    // Toggle adopters drive state with `aria-pressed`; otherwise expose the
    // active item via `aria-current`. We deliberately avoid `role="tab"` —
    // these bars don't implement the ARIA tabs keyboard pattern (arrow nav /
    // roving tabindex / tabpanel wiring), so claiming the role would lie.
    aria-pressed={ariaPressed}
    aria-current={ariaPressed === undefined && selected ? 'true' : undefined}
    className={cn(
      'focus-ring disabled:cursor-not-allowed disabled:opacity-50',
      itemBaseClasses[variant],
      itemStateClasses[variant][selected ? 'selected' : 'idle'],
      className,
    )}
    {...props}
  >
    {icon}
    <span>{children}</span>
    {badge !== undefined && badge !== null && (
      <span className={cn(badgeClasses[variant], selected && selectedBadgeClasses[variant])}>{badge}</span>
    )}
    {trailing}
    {variant === 'underline' && selected && (
      <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-t-full bg-primary" />
    )}
  </button>
)
