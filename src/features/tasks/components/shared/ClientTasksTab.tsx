import { useEffect, useState } from 'react'
import { useClientTasks } from '../../hooks/useClientTasks'
import { useBulkCompleteTasks } from '../../hooks/useBulkCompleteTasks'
import { useBulkAssignTasks } from '../../hooks/useBulkAssignTasks'
import { useActiveUserOptions } from '@/features/users'
import { taskStatusLabels, taskPriorityLabels } from '../../constants/labels'
import { BulkSelectionToolbar, BulkSelectionActionButton } from '@/components/ui/table/BulkSelectionToolbar'
import { PaginationCard } from '@/components/ui/table/PaginationCard'
import { TableSkeleton } from '@/components/ui/table'
import { DetailTabPanel } from '@/components/ui/layout'
import { InlineEmptyState } from '@/components/ui/feedback'
import { Alert } from '@/components/ui/overlays/Alert'
import { Checkbox } from '@/components/ui/primitives/Checkbox'
import { Select } from '@/components/ui/inputs'
import { randomUUID } from '@/utils/random'
import { getErrorMessage } from '@/utils/utils'
import type { Task } from '../../api/contracts'
import { PAGE_SIZE_SM as PAGE_SIZE } from '@/constants/pagination.constants'

interface ClientTasksTabProps {
  clientRecordId: number
}

interface Feedback {
  message: string
  hasFailures: boolean
}

export const ClientTasksTab: React.FC<ClientTasksTabProps> = ({ clientRecordId }) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setSelectedIds(new Set())
    setFeedback(null)
    setPage(1)
  }, [clientRecordId])

  const { data, isLoading, isError } = useClientTasks(clientRecordId, { page, page_size: PAGE_SIZE })
  const bulkComplete = useBulkCompleteTasks()
  const bulkAssign = useBulkAssignTasks()
  const usersQuery = useActiveUserOptions()

  const tasks = data?.items ?? []
  const isBulkLoading = bulkComplete.isPending || bulkAssign.isPending

  const toggleAll = () => {
    if (selectedIds.size === tasks.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(tasks.map((t) => t.id)))
    }
  }

  const toggleOne = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const clearSelection = () => setSelectedIds(new Set())

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    setSelectedIds(new Set())
  }

  const handleBulkComplete = async () => {
    const ids = [...selectedIds]
    try {
      const result = await bulkComplete.mutateAsync({ taskIds: ids, idempotencyKey: randomUUID() })
      clearSelection()
      setFeedback({
        message:
          result.failed.length === 0
            ? `הושלמו ${result.succeeded.length} משימות`
            : `הושלמו ${result.succeeded.length} משימות, ${result.failed.length} נכשלו`,
        hasFailures: result.failed.length > 0,
      })
    } catch (error) {
      setFeedback({ message: getErrorMessage(error, 'פעולת הסימון נכשלה'), hasFailures: true })
    }
  }

  const handleBulkAssign = async (targetAssigneeId: number | null) => {
    const ids = [...selectedIds]
    try {
      const result = await bulkAssign.mutateAsync({
        taskIds: ids,
        assigneeUserId: targetAssigneeId,
        idempotencyKey: randomUUID(),
      })
      clearSelection()
      setAssigneeId('')
      setFeedback({
        message:
          result.failed.length === 0
            ? `שויכו ${result.succeeded.length} משימות`
            : `שויכו ${result.succeeded.length} משימות, ${result.failed.length} נכשלו`,
        hasFailures: result.failed.length > 0,
      })
    } catch (error) {
      setFeedback({ message: getErrorMessage(error, 'פעולת השיוך נכשלה'), hasFailures: true })
    }
  }

  const userOptions = (usersQuery.data?.items ?? []).map((u) => ({ value: String(u.id), label: u.full_name }))

  if (isLoading) {
    return (
      <DetailTabPanel title="משימות" subtitle="משימות פתוחות והיסטוריות המקושרות ללקוח">
        <TableSkeleton rows={4} columns={5} />
      </DetailTabPanel>
    )
  }

  if (isError) {
    return (
      <DetailTabPanel title="משימות" subtitle="משימות פתוחות והיסטוריות המקושרות ללקוח">
        <Alert variant="error" message="שגיאה בטעינת משימות" />
      </DetailTabPanel>
    )
  }

  if (tasks.length === 0) {
    return (
      <DetailTabPanel title="משימות" subtitle="משימות פתוחות והיסטוריות המקושרות ללקוח">
        <InlineEmptyState title="אין משימות ללקוח זה" />
      </DetailTabPanel>
    )
  }

  return (
    <DetailTabPanel title="משימות" subtitle="משימות פתוחות והיסטוריות המקושרות ללקוח">
      {feedback && (
        <div
          className={
            feedback.hasFailures
              ? 'rounded-lg bg-warning-50 border border-warning-200 px-4 py-2 text-sm text-warning-700'
              : 'rounded-lg bg-success-50 border border-success-200 px-4 py-2 text-sm text-success-700'
          }
        >
          {feedback.message}
        </div>
      )}

      {selectedIds.size > 0 && (
        <BulkSelectionToolbar selectedCount={selectedIds.size} loading={isBulkLoading} onClear={clearSelection}>
          <BulkSelectionActionButton
            label="סמן כהושלם"
            onClick={handleBulkComplete}
            loading={bulkComplete.isPending}
            disabled={isBulkLoading}
          />
          <div className="flex items-center gap-2">
            <Select
              size="xs"
              value={assigneeId}
              options={[{ value: '', label: 'בחר משתמש לשיוך' }, ...userOptions]}
              onChange={(e) => setAssigneeId(e.target.value)}
              disabled={isBulkLoading}
            />
            <BulkSelectionActionButton
              label="שייך"
              onClick={() => handleBulkAssign(assigneeId === '' ? null : Number(assigneeId))}
              loading={bulkAssign.isPending}
              disabled={isBulkLoading || assigneeId === ''}
            />
            <BulkSelectionActionButton
              label="הסר שיוך"
              onClick={() => handleBulkAssign(null)}
              loading={bulkAssign.isPending}
              disabled={isBulkLoading}
            />
          </div>
        </BulkSelectionToolbar>
      )}

      <div className="space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 text-xs text-neutral-500">
          <Checkbox checked={tasks.length > 0 && selectedIds.size === tasks.length} onChange={toggleAll} />
          <span className="flex-1">כותרת</span>
          <span className="w-20 text-center">סטטוס</span>
          <span className="w-20 text-center">עדיפות</span>
          <span className="w-28 text-center">תאריך יעד</span>
        </div>

        {tasks.map((task: Task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm hover:bg-neutral-50 transition-colors"
          >
            <Checkbox checked={selectedIds.has(task.id)} onChange={() => toggleOne(task.id)} />
            <span className="flex-1 text-neutral-800 truncate">{task.title}</span>
            <span className="w-20 text-center text-xs text-neutral-600">
              {taskStatusLabels[task.status] ?? task.status}
            </span>
            <span className="w-20 text-center text-xs text-neutral-600">
              {taskPriorityLabels[task.priority] ?? task.priority}
            </span>
            <span className="w-28 text-center text-xs text-neutral-500">{task.due_date ?? '—'}</span>
          </div>
        ))}
      </div>

      {data && data.total > PAGE_SIZE && (
        <PaginationCard
          page={page}
          totalPages={Math.ceil(data.total / PAGE_SIZE)}
          total={data.total}
          label="משימות"
          onPageChange={handlePageChange}
        />
      )}
    </DetailTabPanel>
  )
}
