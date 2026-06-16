import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { TaskModal } from '../components/TaskModal'
import { TasksFiltersPanel } from '../components/TasksFiltersPanel'
import { TasksListPanel } from '../components/TasksListPanel'
import { TasksPageHeader } from '../components/TasksPageHeader'
import { useTasksPage } from '../hooks/useTasksPage'

export const TasksPage: React.FC = () => {
  const page = useTasksPage()

  return (
    <div dir="rtl" className="mx-auto max-w-7xl space-y-4">
      <TasksPageHeader
        total={page.total}
        visibleCount={page.visibleCount}
        featuredTask={page.featuredTask}
        onCreateTask={page.openCreateModal}
      />
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
        isLoading={page.isLoading}
        isError={page.isError}
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
