import { Plus } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { DetailTabPanel } from '@/components/ui/layout'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { Button } from '@/components/ui/primitives/Button'
import { TaskModal } from '../form/TaskModal'
import { TasksBulkToolbar } from '../list/TasksBulkToolbar'
import { TasksListPanel } from '../list/TasksListPanel'
import { TasksListSummary } from '../list/TasksListSummary'
import { useTasksPage } from '../../hooks/useTasksPage'
import { TASKS_MESSAGES } from '../../messages'

interface ClientTasksTabProps {
  clientRecordId: number
}

export const ClientTasksTab: React.FC<ClientTasksTabProps> = ({ clientRecordId }) => {
  const page = useTasksPage({ pinnedClientId: clientRecordId })

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
      summary={
        <TasksListSummary
          summary={page.summary}
          activeStatus={page.activeStatus}
          isLoading={page.isLoading}
          onStatusChange={(status) => page.filterBar.onChange('status', status ?? '')}
        />
      }
    >
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
        includeClientColumn={false}
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
        onPageChange={page.setPage}
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
          detailsError={page.modalLoadError}
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
    </DetailTabPanel>
  )
}

ClientTasksTab.displayName = 'ClientTasksTab'
