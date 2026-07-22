import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { Button } from '@/components/ui/primitives/Button'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { TaskModal } from '../components/form/TaskModal'
import { TasksListPanel } from '../components/list/TasksListPanel'
import { TasksListSummary } from '../components/list/TasksListSummary'
import { TasksBulkToolbar } from '../components/list/TasksBulkToolbar'
import { useTasksPage } from '../hooks/useTasksPage'
import { TASKS_MESSAGES } from '../messages'

export const TasksPage: React.FC = () => {
  const page = useTasksPage()

  return (
    <PageContent>
      <PageHeader
        title={TASKS_MESSAGES.page.title}
        description={TASKS_MESSAGES.page.description}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" aria-hidden="true" />}
            onClick={page.openCreateModal}
            className="shrink-0"
          >
            {TASKS_MESSAGES.actions.newTask}
          </Button>
        }
      />
      {!page.listError ? (
        <TasksListSummary
          summary={page.summary}
          activeStatus={page.activeStatus}
          isLoading={page.isLoading}
          onStatusChange={(status) => page.filterBar.onChange('status', status ?? '')}
        />
      ) : null}
      <FilterPanel {...page.filterBar} title={TASKS_MESSAGES.page.filterTitle} subtitle={TASKS_MESSAGES.page.filterSubtitle} />
      <TasksBulkToolbar
        feedback={page.bulk.feedback}
        selectedCount={page.bulk.selectedCount}
        assigneeId={page.bulk.assigneeId}
        assigneeOptions={page.bulk.assigneeOptions}
        isLoading={page.bulk.isLoading}
        isCompleteLoading={page.bulk.isCompleteLoading}
        isAssignLoading={page.bulk.isAssignLoading}
        onDismissFeedback={page.bulk.dismissFeedback}
        onAssigneeChange={page.bulk.setAssigneeId}
        onClear={page.bulk.clearSelection}
        onComplete={() => void page.bulk.completeSelected()}
        onAssign={(id) => void page.bulk.assignSelected(id)}
      />
      <TasksListPanel
        tasks={page.tasks}
        isLoading={page.isLoading}
        isFetching={page.isFetching}
        error={page.listError}
        hasFilters={page.hasFilters}
        page={page.page}
        total={page.total}
        isActionBusy={page.isActionBusy}
        selection={page.bulk.selection}
        onView={page.openViewModal}
        onEdit={page.openEditModal}
        onComplete={page.completeTask}
        onCancel={page.cancelTask}
        onDelete={page.deleteTask}
        onPageChange={page.setPage}
        onRetry={() => void page.retryList()}
      />

      {page.modal !== null && (
        <TaskModal
          key={`${page.modal.mode}-${page.modalTask?.id ?? 'new'}`}
          mode={page.modal.mode}
          task={page.modalTask}
          detailsError={page.modalLoadError}
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
        confirmVariant={page.confirmDialog.confirmVariant}
        isLoading={page.confirmDialog.isLoading}
        onConfirm={page.confirmDialog.onConfirm}
        onCancel={page.confirmDialog.onCancel}
      />
    </PageContent>
  )
}
