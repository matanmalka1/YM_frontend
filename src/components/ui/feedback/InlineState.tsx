import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { Button } from '../primitives/Button'
import { IconChip } from '../primitives/IconChip'
import { cn } from '@/utils/utils'

interface InlineStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  variant?: 'default' | 'error'
  /** Optional inline action (e.g. retry). */
  action?: { label: string; onClick: () => void }
  className?: string
}

export const InlineState = ({
  title,
  description,
  icon: Icon = Inbox,
  variant = 'default',
  action,
  className,
}: InlineStateProps) => {
  const isError = variant === 'error'
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-10 text-center', className)}>
      <IconChip icon={Icon} size="lg" tone={isError ? 'negative' : 'neutral'} />
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {description && <p className="text-xs text-gray-400">{description}</p>}
      {action && (
        <Button type="button" variant="outline" size="sm" className="mt-1" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

InlineState.displayName = 'InlineState'
