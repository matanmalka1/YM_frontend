import { Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/table'
import { StateCard, type StateCardProps } from '@/components/ui/feedback/StateCard'

interface EmptyState {
  icon?: LucideIcon
  title?: string
  message?: string
  action?: { label: string; onClick: () => void }
  variant?: StateCardProps['variant']
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
        variant={emptyState?.variant}
      />
    )
  }

  return <div className="space-y-2">{children}</div>
}
