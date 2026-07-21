import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Alert } from '@/components/ui/overlays/Alert'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { DetailTabPanel } from '@/components/ui/layout'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { Select } from '@/components/ui/inputs'
import { Button } from '@/components/ui/primitives/Button'
import { BulkSelectionActionButton, BulkSelectionToolbar } from '@/components/ui/table'
import { randomUUID } from '@/utils/random'
import { getErrorMessage } from '@/utils/utils'
import { useActiveUserOptions } from '@/features/users'
import { TaskModal } from '../form/TaskModal'
import { TasksListPanel } from '../list/TasksListPanel'
import { useBulkAssignTasks } from '../../hooks/useBulkAssignTasks'
import { useBulkCompleteTasks } from '../../hooks/useBulkCompleteTasks'
import { useTasksPage } from '../../hooks/useTasksPage'
import { isTaskTerminal } from '../../utils/taskFormatters'
import type { Task } from '../../api/contracts'
import { TASKS_MESSAGES } from '../../messages'
import { TASKS_ERROR_MESSAGES } from '../../errorMessages'

interface ClientTasksTabProps {
  clientRecordId: number
}

interface Feedback {
  message: string
  hasFailures: boolean
}

export const ClientTasksTab: React.FC<ClientTasksTabProps> = ({ clientRecordId }) => {
  const page = useTasksPage({ pinnedClientId: clientRecordId })
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [assigneeId, setAssigneeId] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const bulkComplete = useBulkCompleteTasks()
  const bulkAssign = useBulkAssignTasks()
  const usersQuery = useActiveUserOptions()

  const selectableTasks = page.tasks.filter((task) => !isTaskTerminal(task.status))
  const isBulkLoading = bulkComplete.isPending || bulkAssign.isPending

  // Clear selection whenever the client or the active filters change, so a bulk action
  // can never target rows that are no longer shown.
  const filterSignature = JSON.stringify(page.filterBar.values)
  useEffect(() => {
    setSelectedIds(new Set())
    setFeedback(null)
  }, [clientRecordId, filterSignature])

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
    page.setPage(nextPage)
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

  const userOptions = (usersQuery.data?.items ?? []).map((user) => ({ value: String(user.id), label: user.full_name }))

  return (
    <DetailTabPanel
      title={TASKS_MESSAGES.clientTab.title}
      subtitle={TASKS_MESSAGES.clientTab.subtitle}
      actions={
        <div className="flex items-center gap-2">
          <FilterPanel
            {...page.filterBar}
            title={TASKS_MESSAGES.page.filterTitle}
            subtitle={TASKS_MESSAGES.page.filterSubtitle}
          />
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" aria-hidden="true" />}
            onClick={page.openCreateModal}
          >
            {TASKS_MESSAGES.actions.newTask}
          </Button>
        </div>
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
      <TasksListPanel
        tasks={page.tasks}
        isLoading={page.isLoading}
        isFetching={page.isFetching}
        error={page.listError}
        hasFilters={page.hasFilters}
        page={page.page}
        total={page.total}
        isActionBusy={page.isActionBusy}
        selection={{
          selectedIds,
          selectableCount: selectableTasks.length,
          disabled: isBulkLoading,
          onToggle: toggleOne,
          onToggleAll: toggleAll,
        }}
        emptyState={{
          title: TASKS_MESSAGES.clientTab.emptyTitle,
          message: TASKS_MESSAGES.clientTab.emptyMessage,
          action: { label: TASKS_MESSAGES.actions.newTask, onClick: page.openCreateModal },
        }}
        onView={page.openViewModal}
        onEdit={page.openEditModal}
        onComplete={page.completeTask}
        onCancel={page.cancelTask}
        onDelete={page.deleteTask}
        onPageChange={handlePageChange}
        onRetry={() => void page.retryList()}
      />

      {page.modal !== null && (
        <TaskModal
          key={`${page.modal.mode}-${page.modalTask?.id ?? 'new'}`}
          mode={page.modal.mode}
          task={page.modalTask}
          clientRecordId={clientRecordId}
          isLoading={page.isModalLoading}
          error={page.actionError}
          onSubmit={page.submitModal}
          onClose={page.closeModal}
        />
      )}

      <ConfirmDialog
        open={page.confirmDialog.open}
        title={page.confirmDialog.title}
        message={page.confirmDialog.message}
        confirmLabel={page.confirmDialog.confirmLabel}
        confirmVariant="danger"
        isLoading={page.confirmDialog.isLoading}
        onConfirm={page.confirmDialog.onConfirm}
        onCancel={page.confirmDialog.onCancel}
      />
    </DetailTabPanel>
  )
}

ClientTasksTab.displayName = 'ClientTasksTab'
