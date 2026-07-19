import { GLOBAL_UI_MESSAGES } from '@/messages'
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
import { BulkSelectionActionButton, BulkSelectionToolbar, PaginatedDataTable, type Column } from '@/components/ui/table'
import { PAGE_SIZE_SM as PAGE_SIZE } from '@/constants/pagination.constants'
import { randomUUID } from '@/utils/random'
import { getErrorMessage } from '@/utils/utils'
import type { Task, TaskCreateRequest } from '../../api/contracts'
import { TASKS_MESSAGES } from '../../messages'
import { TASKS_ERROR_MESSAGES } from '../../errorMessages'

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
            ? TASKS_MESSAGES.clientTab.bulkCompleteSuccess(result.succeeded.length)
            : TASKS_ERROR_MESSAGES.clientTab.bulkCompletePartial(result.succeeded.length, result.failed.length),
        hasFailures: result.failed.length > 0,
      })
    } catch (error) {
      setFeedback({
        message: getErrorMessage(error, TASKS_ERROR_MESSAGES.clientTab.bulkCompleteFailed),
        hasFailures: true,
      })
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
            ? TASKS_MESSAGES.clientTab.bulkAssignSuccess(result.succeeded.length)
            : TASKS_ERROR_MESSAGES.clientTab.bulkAssignPartial(result.succeeded.length, result.failed.length),
        hasFailures: result.failed.length > 0,
      })
    } catch (error) {
      setFeedback({
        message: getErrorMessage(error, TASKS_ERROR_MESSAGES.clientTab.bulkAssignFailed),
        hasFailures: true,
      })
    }
  }

  const columns: Array<Column<Task>> = [
    {
      key: 'selection',
      header: '',
      headerRender: () => (
        <Checkbox
          aria-label={TASKS_MESSAGES.clientTab.selectAllOpen}
          checked={selectableTasks.length > 0 && selectedIds.size === selectableTasks.length}
          onChange={toggleAll}
          disabled={isBulkLoading || selectableTasks.length === 0}
        />
      ),
      render: (task) => (
        <Checkbox
          aria-label={TASKS_MESSAGES.clientTab.selectTask(task.title)}
          checked={selectedIds.has(task.id)}
          onChange={() => toggleOne(task)}
          disabled={isBulkLoading || isTaskTerminal(task.status)}
          title={isTaskTerminal(task.status) ? TASKS_MESSAGES.clientTab.terminalBulkTitle : undefined}
        />
      ),
    },
    {
      key: 'title',
      header: TASKS_MESSAGES.columns.title,
      render: (task) => <span className="font-semibold text-gray-900">{task.title}</span>,
      wrap: true,
    },
    {
      key: 'status',
      header: GLOBAL_UI_MESSAGES.common.status,
      render: (task) => (
        <Badge variant={getTaskStatusBadgeVariant(task.status)} size="sm">
          {taskStatusLabels[task.status]}
        </Badge>
      ),
    },
    { key: 'priority', header: TASKS_MESSAGES.columns.priority, render: (task) => taskPriorityLabels[task.priority] },
    { key: 'dueDate', header: TASKS_MESSAGES.columns.dueDate, render: (task) => formatTaskDueDate(task.due_date) },
  ]

  const userOptions = (usersQuery.data?.items ?? []).map((user) => ({ value: String(user.id), label: user.full_name }))
  const createError = createTask.isError
    ? getErrorMessage(createTask.error, TASKS_ERROR_MESSAGES.clientTab.createError)
    : null

  return (
    <DetailTabPanel
      title={TASKS_MESSAGES.clientTab.title}
      subtitle={TASKS_MESSAGES.clientTab.subtitle}
      actions={
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" aria-hidden="true" />}
          onClick={() => {
            createTask.reset()
            setCreateOpen(true)
          }}
        >
          {TASKS_MESSAGES.actions.newTask}
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
            label={TASKS_MESSAGES.actions.completeBulk}
            onClick={handleBulkComplete}
            loading={bulkComplete.isPending}
            disabled={isBulkLoading}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              size="xs"
              value={assigneeId}
              options={[{ value: '', label: TASKS_MESSAGES.clientTab.chooseAssignee }, ...userOptions]}
              onChange={(event) => setAssigneeId(event.target.value)}
              disabled={isBulkLoading}
            />
            <BulkSelectionActionButton
              label={TASKS_MESSAGES.actions.assign}
              onClick={() => handleBulkAssign(Number(assigneeId))}
              loading={bulkAssign.isPending}
              disabled={isBulkLoading || assigneeId === ''}
            />
            <BulkSelectionActionButton
              label={TASKS_MESSAGES.actions.unassign}
              onClick={() => handleBulkAssign(null)}
              loading={bulkAssign.isPending}
              disabled={isBulkLoading}
            />
          </div>
        </BulkSelectionToolbar>
      ) : null}
      {isError ? (
        <Alert variant="error" message={TASKS_ERROR_MESSAGES.clientTab.loadError} onRetry={() => void refetch()} />
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
          label={TASKS_MESSAGES.list.label}
          onPageChange={handlePageChange}
          showPagination={(data?.total ?? 0) > PAGE_SIZE}
          emptyState={{
            title: TASKS_MESSAGES.clientTab.emptyTitle,
            message: TASKS_MESSAGES.clientTab.emptyMessage,
            action: {
              label: TASKS_MESSAGES.actions.newTask,
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
