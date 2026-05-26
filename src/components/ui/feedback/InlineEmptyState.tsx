import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/utils/utils'

interface InlineEmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  className?: string
}

export const InlineEmptyState = ({
  title,
  description,
  icon: Icon = Inbox,
  className,
}: InlineEmptyStateProps) => (
  <div className={cn('flex flex-col items-center justify-center gap-2 py-10 text-center', className)}>
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
      <Icon className="h-5 w-5" />
    </span>
    <p className="text-sm font-semibold text-gray-700">{title}</p>
    {description && <p className="text-xs text-gray-400">{description}</p>}
  </div>
)

InlineEmptyState.displayName = 'InlineEmptyState'
