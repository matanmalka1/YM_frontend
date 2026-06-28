import { AlertTriangle, Info, AlertCircle, CheckCircle, RotateCcw, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../utils/utils'

interface AlertProps {
  message: React.ReactNode
  variant?: 'warning' | 'info' | 'error' | 'success' | 'neutral'
  size?: 'sm' | 'md'
  /** Replaces the variant's default icon while retaining its semantic palette. */
  icon?: LucideIcon
  dismissible?: boolean
  onDismiss?: () => void
  onRetry?: () => void
  className?: string
}

const config = {
  warning: {
    container: 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200/80',
    icon: 'text-orange-600',
    text: 'text-orange-900',
    iconBg: 'bg-orange-100',
    retry: 'border-orange-200 text-orange-700 hover:bg-orange-50',
    Icon: AlertTriangle,
  },
  info: {
    container: 'bg-gradient-to-r from-primary-50 to-cyan-50 border-primary-200/80',
    icon: 'text-primary-600',
    text: 'text-primary-900',
    iconBg: 'bg-primary-100',
    retry: 'border-primary-200 text-primary-700 hover:bg-primary-50',
    Icon: Info,
  },
  error: {
    container: 'bg-gradient-to-r from-negative-50 to-rose-50 border-negative-200/80',
    icon: 'text-negative-600',
    text: 'text-negative-800',
    iconBg: 'bg-negative-100',
    retry: 'border-negative-200 text-negative-600 hover:bg-negative-50',
    Icon: AlertCircle,
  },
  success: {
    container: 'bg-gradient-to-r from-positive-50 to-emerald-50 border-positive-200/80',
    icon: 'text-positive-700',
    text: 'text-positive-800',
    iconBg: 'bg-positive-100',
    retry: 'border-positive-200 text-positive-700 hover:bg-positive-50',
    Icon: CheckCircle,
  },
  neutral: {
    container: 'bg-gray-50 border-gray-200 shadow-none',
    icon: 'text-gray-500',
    text: 'text-gray-600',
    iconBg: 'bg-gray-100',
    retry: 'border-gray-200 text-gray-600 hover:bg-gray-50',
    Icon: Info,
  },
}

export const Alert: React.FC<AlertProps> = ({
  message,
  variant = 'warning',
  size = 'md',
  icon: CustomIcon,
  dismissible = false,
  onDismiss,
  onRetry,
  className,
}) => {
  const c = config[variant]
  const Icon = CustomIcon ?? c.Icon
  const isSmall = size === 'sm'

  return (
    <div
      className={cn(
        'flex items-start rounded-xl border transition-all duration-300 animate-slide-in',
        isSmall ? 'gap-2.5 p-2.5 shadow-none' : 'gap-4 p-4 shadow-sm',
        c.container,
        className,
      )}
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
    >
      <div className={cn('shrink-0', isSmall ? 'rounded-md p-1' : 'rounded-lg p-2', c.iconBg)}>
        <Icon className={cn(isSmall ? 'h-4 w-4' : 'h-5 w-5', c.icon)} />
      </div>

      <div className={cn('flex-1', isSmall ? '' : 'pt-0.5')}>
        <p className={cn('font-medium leading-relaxed', isSmall ? 'text-xs' : 'text-sm', c.text)}>{message}</p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-xs font-medium transition-colors',
            c.retry,
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          נסה שנית
        </button>
      )}

      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn('shrink-0 rounded-lg p-1.5 transition-colors hover:bg-white/50', c.text)}
          aria-label="סגור התראה"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
