import { cn } from '../../../utils/utils'

interface IconLabelProps {
  icon?: React.ReactNode
  label: string
  size?: 'xs' | 'sm' | 'md'
  /** Enables font-mono (MetaChip mode) */
  mono?: boolean
  /** Adds border (MetaChip mode) */
  bordered?: boolean
  className?: string
}

const iconLabelSizeClasses = {
  xs: 'gap-1 px-2 py-0.5 text-xs',
  sm: 'gap-1 px-2.5 py-0.5 text-xs',
  md: 'gap-1.5 px-3 py-1 text-sm',
}

export const IconLabel: React.FC<IconLabelProps> = ({ icon, label, size = 'sm', mono, bordered, className }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full',
      iconLabelSizeClasses[size],
      mono && 'font-mono',
      bordered && 'border',
      className,
    )}
  >
    {icon}
    {label}
  </span>
)

IconLabel.displayName = 'IconLabel'
