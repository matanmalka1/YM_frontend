import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { TaskModal } from '../form/TaskModal'
import { tasksApi } from '../../api/tasks.api'
import { tasksQK } from '../../api/queryKeys'
import { useBulkAssignTasks } from '../../hooks/useBulkAssignTasks'
import { useBulkCompleteTasks } from '../../hooks/useBulkCompleteTasks'
import { useClientTasks } from '../../hooks/useClientTasks'
import { taskPriorityLabels, taskStatusLabels } from '../../constants/labels'
import { formatTaskDueDate, isTaskTerminal } from '../../utils/taskFormatters'
import { getTaskStatusBadgeVariant } from '../../utils/taskDisplay'
import { useActiveUserOptions } from '@/features/users'
import { Alert } from '@/components/ui/overlays/Alert'
import { DetailTabPanel } from '@/components/ui/layout'
import { Select } from '@/components/ui/inputs'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { Checkbox } from '@/components/ui/primitives/Checkbox'
import { BulkSelectionActionButton, BulkSelectionToolbar } from '@/components/ui/table/BulkSelectionToolbar'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import type { Column } from '@/components/ui/table/DataTable'
import { PAGE_SIZE_SM as PAGE_SIZE } from '@/constants/pagination.constants'
import { randomUUID } from '@/utils/random'
import { getErrorMessage } from '@/utils/utils'
import type { Task, TaskCreateRequest } from '../../api/contracts'

interface ClientTasksTabProps {
  clientRecordId: number
}

interface Feedback {
  message: string
  hasFailures: boolean
}

const EMPTY_TASKS: Task[] = []

export const ClientTasksTab: React.FC<ClientTasksTabProps> = ({ clientRecordId }) => {
  const queryClient = useQueryClient()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [assigneeId, setAssigneeId] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const { data, isLoading, isFetching, isError, refetch } = useClientTasks(clientRecordId, {
    page,
    page_size: PAGE_SIZE,
  })
  const bulkComplete = useBulkCompleteTasks()
  const bulkAssign = useBulkAssignTasks()
  const usersQuery = useActiveUserOptions()
  const createTask = useMutation({
    mutationFn: (payload: TaskCreateRequest) => tasksApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQK.all })
      setCreateOpen(false)
    },
  })

  const tasks = data?.items ?? EMPTY_TASKS
  const selectableTasks = tasks.filter((task) => !isTaskTerminal(task.status))
  const isBulkLoading = bulkComplete.isPending || bulkAssign.isPending

  useEffect(() => {
    setSelectedIds(new Set())
    setFeedback(null)
    setPage(1)
  }, [clientRecordId])

  const toggleAll = () => {
    setSelectedIds((current) =>
      current.size === selectableTasks.length ? new Set() : new Set(selectableTasks.map((task) => task.id)),
    )
  }
  const toggleOne = (task: Task) => {
    if (isTaskTerminal(task.status)) return
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(task.id)) next.delete(task.id)
      else next.add(task.id)
      return next
    })
  }
  const clearSelection = () => setSelectedIds(new Set())
  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    clearSelection()
  }
  const handleBulkComplete = async () => {
    try {
      const result = await bulkComplete.mutateAsync({ taskIds: [...selectedIds], idempotencyKey: randomUUID() })
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
    try {
      const result = await bulkAssign.mutateAsync({
        taskIds: [...selectedIds],
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

  const columns: Array<Column<Task>> = [
    {
      key: 'selection',
      header: '',
      align: 'center',
      headerRender: () => (
        <Checkbox
          aria-label="בחר את כל המשימות הפתוחות"
          checked={selectableTasks.length > 0 && selectedIds.size === selectableTasks.length}
          onChange={toggleAll}
          disabled={isBulkLoading || selectableTasks.length === 0}
        />
      ),
      render: (task) => (
        <Checkbox
          aria-label={`בחר משימה ${task.title}`}
          checked={selectedIds.has(task.id)}
          onChange={() => toggleOne(task)}
          disabled={isBulkLoading || isTaskTerminal(task.status)}
          title={isTaskTerminal(task.status) ? 'ניתן לבצע פעולות מרוכזות רק על משימות פתוחות' : undefined}
        />
      ),
    },
    {
      key: 'title',
      header: 'כותרת',
      align: 'right',
      render: (task) => <span className="font-medium text-gray-900">{task.title}</span>,
      wrap: true,
    },
    {
      key: 'status',
      header: 'סטטוס',
      render: (task) => (
        <Badge variant={getTaskStatusBadgeVariant(task.status)} size="sm">
          {taskStatusLabels[task.status]}
        </Badge>
      ),
    },
    { key: 'priority', header: 'עדיפות', render: (task) => taskPriorityLabels[task.priority] },
    { key: 'dueDate', header: 'תאריך יעד', render: (task) => formatTaskDueDate(task.due_date) },
  ]

  const userOptions = (usersQuery.data?.items ?? []).map((user) => ({ value: String(user.id), label: user.full_name }))
  const createError = createTask.isError ? getErrorMessage(createTask.error, 'יצירת המשימה נכשלה') : null

  return (
    <DetailTabPanel
      title="משימות"
      subtitle="משימות פתוחות והיסטוריות המקושרות ללקוח"
      actions={
        <Button
          size="sm"
          onClick={() => {
            createTask.reset()
            setCreateOpen(true)
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          משימה חדשה
        </Button>
      }
    >
      {feedback ? (
        <Alert
          variant={feedback.hasFailures ? 'warning' : 'success'}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
          dismissible
        />
      ) : null}
      {selectedIds.size > 0 ? (
        <BulkSelectionToolbar selectedCount={selectedIds.size} loading={isBulkLoading} onClear={clearSelection}>
          <BulkSelectionActionButton
            label="סמן כהושלם"
            onClick={handleBulkComplete}
            loading={bulkComplete.isPending}
            disabled={isBulkLoading}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              size="xs"
              value={assigneeId}
              options={[{ value: '', label: 'בחר משתמש לשיוך' }, ...userOptions]}
              onChange={(event) => setAssigneeId(event.target.value)}
              disabled={isBulkLoading}
            />
            <BulkSelectionActionButton
              label="שייך"
              onClick={() => handleBulkAssign(Number(assigneeId))}
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
      ) : null}
      {isError ? (
        <Alert variant="error" message="שגיאה בטעינת משימות" onRetry={() => void refetch()} />
      ) : (
        <PaginatedDataTable
          columns={columns}
          data={tasks}
          getRowKey={(task) => task.id}
          isLoading={isLoading}
          isFetching={isFetching}
          page={page}
          pageSize={PAGE_SIZE}
          total={data?.total ?? 0}
          label="משימות"
          onPageChange={handlePageChange}
          showPagination={(data?.total ?? 0) > PAGE_SIZE}
          emptyState={{
            title: 'אין משימות ללקוח זה',
            message: 'אפשר ליצור משימה חדשה עבור הלקוח.',
            action: {
              label: 'משימה חדשה',
              onClick: () => {
                createTask.reset()
                setCreateOpen(true)
              },
            },
          }}
        />
      )}
      {createOpen ? (
        <TaskModal
          mode="create"
          clientRecordId={clientRecordId}
          isLoading={createTask.isPending}
          error={createError}
          onSubmit={(data) => createTask.mutate(data as TaskCreateRequest)}
          onClose={() => {
            createTask.reset()
            setCreateOpen(false)
          }}
        />
      ) : null}
    </DetailTabPanel>
  )
}

ClientTasksTab.displayName = 'ClientTasksTab'
