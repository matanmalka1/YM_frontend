import { cn } from '../../../utils/utils'
import { Tooltip } from './Tooltip'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  isLoading?: boolean
  loadingLabel?: string
  fullWidth?: boolean
  tooltip?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  loadingLabel,
  disabled,
  fullWidth = false,
  tooltip,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100',
    ghost: 'text-gray-600 hover:bg-gray-200 active:bg-gray-200',
    danger: 'bg-negative-600 text-white hover:bg-negative-700 active:bg-negative-800 shadow-sm',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
  }

  const btn = (
    <button
      className={cn(
        'rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'transition-all duration-200',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {isLoading && loadingLabel ? (
        <span>{loadingLabel}</span>
      ) : (
        <span className={cn('inline-flex items-center gap-2', isLoading && 'opacity-0')}>{children}</span>
      )}
    </button>
  )

  return tooltip ? <Tooltip text={tooltip}>{btn}</Tooltip> : btn
}
