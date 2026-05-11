import { format, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'
import { DataTable } from '@/components/ui/table/DataTable'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import type { Task } from '../api/contracts'
import { taskStatusLabels, taskPriorityLabels } from '../constants'

interface TasksTableProps {
  items: Task[]
  isLoading?: boolean
  onStart: (id: number) => void
  onComplete: (id: number) => void
  onCancel: (id: number) => void
}

const formatDate = (s?: string | null) => {
  if (!s) return '—'
  try {
    return format(parseISO(s), 'dd/MM/yyyy', { locale: he })
  } catch {
    return s
  }
}

export const TasksTable: React.FC<TasksTableProps> = ({ items, isLoading, onStart, onComplete, onCancel }) => {
  const columns = [
    {
      key: 'title',
      header: 'משימה',
      render: (t: Task) => <span className="font-medium text-gray-900">{t.title}</span>,
    },
    {
      key: 'status',
      header: 'סטטוס',
      render: (t: Task) => <Badge variant="neutral">{taskStatusLabels[t.status] ?? t.status}</Badge>,
    },
    {
      key: 'priority',
      header: 'עדיפות',
      render: (t: Task) => (
        <span className="text-sm text-gray-600">{taskPriorityLabels[t.priority] ?? t.priority}</span>
      ),
    },
    {
      key: 'due_date',
      header: 'תאריך יעד',
      render: (t: Task) => <span className="text-sm tabular-nums text-gray-700">{formatDate(t.due_date)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (t: Task) => {
        if (t.status === 'done' || t.status === 'canceled') return null
        return (
          <div className="flex gap-2">
            {t.status === 'open' && (
              <Button variant="ghost" size="sm" onClick={() => onStart(t.id)}>
                התחל
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onComplete(t.id)}>
              השלם
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onCancel(t.id)}>
              בטל
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      data={items}
      columns={columns}
      getRowKey={(t) => String(t.id)}
      isLoading={isLoading}
      emptyMessage="אין משימות להצגה"
    />
  )
}
