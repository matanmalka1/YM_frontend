import { cn } from '../../../utils/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Accessible label; omit for purely decorative spinners alongside visible text */
  label?: string
}

const sizeClass = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => (
  <div
    role="status"
    aria-label={label}
    aria-hidden={label ? undefined : true}
    className={cn('animate-spin rounded-full border-2 border-gray-200 border-t-primary-600', sizeClass[size], className)}
  />
)

Spinner.displayName = 'Spinner'
