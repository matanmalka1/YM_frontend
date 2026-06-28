import { memo, useState } from 'react'
import { ChevronDown, Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/primitives/Card'
import { TableSkeleton } from '../core/TableSkeleton'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { cn } from '@/utils/utils'

interface MonthlyAccordionGroupProps {
  title: string
  summary: string
  isCurrent?: boolean
  badges?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}

const MonthlyAccordionGroup = memo(
  ({ title, summary, isCurrent = false, badges, defaultOpen, children }: MonthlyAccordionGroupProps) => {
    const [expanded, setExpanded] = useState(() => defaultOpen ?? isCurrent)

    return (
      <Card className={cn('overflow-hidden p-0', isCurrent && 'border-primary-300')}>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={cn(
            'flex min-h-[56px] w-full items-center justify-between gap-3 px-4 py-2 text-right',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset',
            isCurrent ? 'bg-primary-50/60 hover:bg-primary-50' : 'hover:bg-gray-50/60',
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{title}</span>
            {isCurrent && (
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                חודש נוכחי
              </span>
            )}
            <span className="text-sm font-normal text-gray-400">{summary}</span>
            {badges}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 transition-transform',
              isCurrent ? 'text-primary-400' : 'text-gray-400',
              !expanded && '-rotate-90',
            )}
          />
        </button>

        {expanded && <div className="border-t border-gray-100">{children}</div>}
      </Card>
    )
  },
)

MonthlyAccordionGroup.displayName = 'MonthlyAccordionGroup'

interface EmptyState {
  icon?: LucideIcon
  title?: string
  message?: string
  action?: { label: string; onClick: () => void }
}

interface MonthlyAccordionListProps {
  isLoading?: boolean
  isEmpty?: boolean
  emptyState?: EmptyState
  skeletonRows?: number
  skeletonCols?: number
  children: React.ReactNode
}

export const MonthlyAccordionList = ({
  isLoading = false,
  isEmpty = false,
  emptyState,
  skeletonRows = 5,
  skeletonCols = 5,
  children,
}: MonthlyAccordionListProps) => {
  if (isLoading) return <TableSkeleton rows={skeletonRows} columns={skeletonCols} />

  if (isEmpty) {
    return (
      <StateCard
        icon={emptyState?.icon ?? Inbox}
        title={emptyState?.title}
        message={emptyState?.message ?? 'אין פריטים'}
        action={emptyState?.action}
      />
    )
  }

  return <div className="space-y-2">{children}</div>
}
