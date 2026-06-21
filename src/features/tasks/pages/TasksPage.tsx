import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/primitives/Button'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { TaskModal } from '../components/form/TaskModal'
import { TasksFiltersPanel } from '../components/list/TasksFiltersPanel'
import { TasksListPanel } from '../components/list/TasksListPanel'
import { TasksListSummary } from '../components/list/TasksListSummary'
import { useTasksPage } from '../hooks/useTasksPage'

export const TasksPage: React.FC = () => {
  const page = useTasksPage()

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <PageHeader
        title="משימות"
        description="ניהול משימות, שיוכים ותאריכי יעד"
        actions={
          <Button size="sm" onClick={page.openCreateModal} className="shrink-0 rounded-xl">
            <Plus className="h-4 w-4" aria-hidden="true" />
            משימה חדשה
          </Button>
        }
      />
      <TasksListSummary total={page.total} visibleCount={page.visibleCount} featuredTask={page.featuredTask} />
      <TasksFiltersPanel
        filters={page.filters}
        hasFilters={page.hasFilters}
        statusOptions={page.statusOptions}
        priorityOptions={page.priorityOptions}
        roleOptions={page.roleOptions}
        userOptions={page.userOptions}
        sourceOptions={page.sourceOptions}
        onFilterChange={page.handleFilterChange}
        onReset={page.resetFilters}
      />
      <TasksListPanel
        tasks={page.tasks}
        status={page.status}
        hasFilters={page.hasFilters}
        page={page.page}
        total={page.total}
        totalPages={page.totalPages}
        isActionBusy={page.isActionBusy}
        actionError={page.actionError}
        onView={page.openViewModal}
        onEdit={page.openEditModal}
        onComplete={page.completeTask}
        onCancel={page.cancelTask}
        onDelete={page.deleteTask}
        onPageChange={page.setPage}
      />

      {page.modal !== null && (
        <TaskModal
          key={`${page.modal.mode}-${page.modalTask?.id ?? 'new'}`}
          mode={page.modal.mode}
          task={page.modalTask}
          isLoading={page.isModalLoading}
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
    </div>
  )
}
