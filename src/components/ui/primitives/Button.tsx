import { cn } from '../../../utils/utils'
import { Tooltip } from './Tooltip'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'
  size?: 'sm' | 'md' | 'lg'
  /** `pill` (default) for text buttons; `square` for icon-only chrome (rounded-xl, equal h/w). */
  shape?: 'pill' | 'square'
  /** Icon element rendered alongside (or, for `shape="square"`, instead of) the label. */
  icon?: React.ReactNode
  /** Logical side the icon sits on relative to the label. Defaults to `start`. */
  iconPosition?: 'start' | 'end'
  isLoading?: boolean
  loadingLabel?: string
  fullWidth?: boolean
  tooltip?: string
}

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100',
  ghost: 'text-gray-600 hover:bg-gray-200 active:bg-gray-200',
  danger: 'bg-negative-600 text-white hover:bg-negative-700 active:bg-negative-800 shadow-sm',
  link: 'text-gray-600 underline underline-offset-2 hover:text-gray-900 active:text-gray-950',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

const squareSizes = {
  sm: 'h-8 w-8 p-0',
  md: 'h-9 w-9 p-0',
  lg: 'h-10 w-10 p-0',
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  icon,
  iconPosition = 'start',
  isLoading,
  loadingLabel,
  disabled,
  fullWidth = false,
  tooltip,
  ...props
}) => {
  const isLink = variant === 'link'
  const isSquare = shape === 'square'

  const btn = (
    <button
      type="button"
      className={cn(
        'font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
        'focus-ring',
        'transition-all duration-200',
        isLink ? 'rounded-sm' : isSquare ? 'rounded-xl' : 'rounded-full',
        variants[variant],
        !isLink && (isSquare ? squareSizes[size] : sizes[size]),
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
        <span className={cn('inline-flex items-center gap-2', isLoading && 'opacity-0')}>
          {icon && iconPosition === 'start' && icon}
          {children}
          {icon && iconPosition === 'end' && icon}
        </span>
      )}
    </button>
  )

  return tooltip ? <Tooltip text={tooltip}>{btn}</Tooltip> : btn
}
