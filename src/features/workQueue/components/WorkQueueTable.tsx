import { useMemo } from 'react'
import { DataTable } from '@/components/ui/table/DataTable'
import type { WorkQueueAction, WorkQueueItem } from '../api/contracts'
import { buildWorkQueueColumns } from './workQueueColumns'

interface WorkQueueTableProps {
  items: WorkQueueItem[]
  isLoading?: boolean
  activeActionKey?: string | null
  onAction: (item: WorkQueueItem, action: WorkQueueAction, focusTarget?: HTMLElement | null) => void
}

export const WorkQueueTable: React.FC<WorkQueueTableProps> = ({ items, isLoading, activeActionKey, onAction }) => {
  const { showLinkedTasks, showWarnings } = useMemo(
    () => ({
      showLinkedTasks: items.some((item) => item.linked_tasks_count > 0),
      showWarnings: items.some((item) => item.warnings.length > 0),
    }),
    [items],
  )
  const columns = useMemo(
    () => buildWorkQueueColumns({ activeActionKey, onAction, showLinkedTasks, showWarnings }),
    [showLinkedTasks, showWarnings, activeActionKey, onAction],
  )

  return (
    <DataTable
      data={items}
      columns={columns}
      getRowKey={(item) => item.id}
      isLoading={isLoading}
      emptyMessage="אין משימות להצגה"
      stickyHeader
    />
  )
}
