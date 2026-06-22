import { Card } from '../primitives/Card'
import { Button } from '../primitives/Button'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../utils/utils'

export interface StateCardProps {
  icon: LucideIcon
  title?: string
  message: string
  variant?: 'default' | 'illustration' | 'minimal' | 'error'
  action?: { label: string; onClick: () => void }
  secondaryAction?: { label: string; onClick: () => void }
  /** Dev-only error details block */
  details?: string
  className?: string
  size?: 'default' | 'compact'
}

export const StateCard: React.FC<StateCardProps> = ({
  icon: Icon,
  title,
  message,
  variant = 'default',
  action,
  secondaryAction,
  details,
  className,
  size = 'default',
}) => {
  const isError = variant === 'error'
  const isIllustration = variant === 'illustration'
  const isCompact = size === 'compact'

  return (
    <Card className={cn(!isError && 'border-dashed', className)} variant="elevated">
      <div className={cn('flex flex-col items-center justify-center px-6 text-center', isCompact ? 'py-4' : 'py-12')}>
        <div
          className={cn(
            'relative animate-scale-in',
            isCompact ? 'mb-3' : 'mb-6',
            isIllustration && !isCompact && 'mb-8',
          )}
        >
          {isIllustration && (
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary-100 rounded-full opacity-40 animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary-200 rounded-full opacity-60" />
            </div>
          )}
          <div
            className={cn(
              'relative rounded-2xl transition-transform duration-300 hover:scale-110',
              isCompact ? 'p-3' : 'p-5',
              isError
                ? 'rounded-full bg-negative-100 p-4'
                : isIllustration
                  ? 'bg-gradient-to-br from-primary-100 to-warning-100 shadow-lg'
                  : 'bg-gray-100',
            )}
          >
            <Icon
              className={cn(
                'transition-colors duration-300',
                isError
                  ? 'h-12 w-12 text-negative-600'
                  : isIllustration
                    ? 'h-12 w-12 text-primary-600'
                    : isCompact
                      ? 'h-5 w-5 text-gray-400'
                      : 'h-10 w-10 text-gray-400',
              )}
            />
          </div>
        </div>

        {title && (
          <h3
            className={cn(
              'mb-3 font-semibold text-gray-900',
              isCompact ? 'text-sm' : isError ? 'text-2xl font-bold' : 'text-xl',
            )}
          >
            {title}
          </h3>
        )}

        <p
          className={cn(
            'max-w-md leading-relaxed text-gray-600',
            isCompact ? 'mb-3 text-sm' : isError ? 'mb-6 text-base' : 'mb-6 text-base max-w-3xl',
          )}
        >
          {message}
        </p>

        {details && (
          <div className="text-start bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4 w-full">
            <div className="text-xs font-mono text-negative-600 whitespace-pre-wrap break-all">{details}</div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <Button onClick={action.onClick} variant={isError ? 'primary' : 'primary'}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

StateCard.displayName = 'StateCard'
