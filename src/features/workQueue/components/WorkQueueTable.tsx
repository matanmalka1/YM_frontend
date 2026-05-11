import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'
import { DataTable } from '@/components/ui/table/DataTable'
import { Badge } from '@/components/ui/primitives/Badge'
import type { WorkQueueItem } from '../api/contracts'
import { workQueueSourceTypeLabels, workQueueUrgencyLabels, workQueueUrgencyVariant } from '../constants'

interface WorkQueueTableProps {
  items: WorkQueueItem[]
  isLoading?: boolean
}

const typeLabel = (sourceType: string): string =>
  workQueueSourceTypeLabels[sourceType as keyof typeof workQueueSourceTypeLabels] ?? sourceType

const formatDueDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—'
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: he })
  } catch {
    return dateStr
  }
}

export const WorkQueueTable: React.FC<WorkQueueTableProps> = ({ items, isLoading }) => {
  const columns = [
    {
      key: 'label',
      header: 'משימה',
      render: (item: WorkQueueItem) => <span className="font-medium text-gray-900">{item.label}</span>,
    },
    {
      key: 'type',
      header: 'סוג',
      render: (item: WorkQueueItem) => <span className="text-sm text-gray-600">{typeLabel(item.source_type)}</span>,
    },
    {
      key: 'due_date',
      header: 'תאריך יעד',
      render: (item: WorkQueueItem) => (
        <span className="text-sm tabular-nums text-gray-700">{formatDueDate(item.due_date)}</span>
      ),
    },
    {
      key: 'urgency',
      header: 'דחיפות',
      render: (item: WorkQueueItem) => {
        const urgency = item.urgency ?? 'upcoming'
        return (
          <Badge variant={workQueueUrgencyVariant[urgency as keyof typeof workQueueUrgencyVariant] ?? 'neutral'}>
            {workQueueUrgencyLabels[urgency as keyof typeof workQueueUrgencyLabels] ?? urgency}
          </Badge>
        )
      },
    },
    {
      key: 'client',
      header: 'לקוח',
      render: (item: WorkQueueItem) =>
        item.client_record_id != null ? (
          <Link
            to={`/clients/${item.client_record_id}`}
            className="text-sm text-primary-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {item.client_name ?? 'לפרופיל לקוח'}
          </Link>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        ),
    },
  ]

  return (
    <DataTable
      data={items}
      columns={columns}
      getRowKey={(item) => `${item.source_type}-${item.source_id}`}
      isLoading={isLoading}
      emptyMessage="אין משימות להצגה"
    />
  )
}
