import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/primitives/Button'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { TaskModal } from '../components/form/TaskModal'
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
          <Button
            size="sm"
            icon={<Plus className="h-4 w-4" aria-hidden="true" />}
            onClick={page.openCreateModal}
            className="shrink-0 rounded-xl"
          >
            משימה חדשה
          </Button>
        }
      />
      {!page.isLoading && !page.listError ? (
        <TasksListSummary total={page.total} visibleCount={page.visibleCount} featuredTask={page.featuredTask} />
      ) : null}
      <FilterPanel {...page.filterBar} title="סינון משימות" subtitle="סטטוס, עדיפות, שיוך, מקור וטווח יעד" />
      <TasksListPanel
        tasks={page.tasks}
        isLoading={page.isLoading}
        isFetching={page.isFetching}
        error={page.listError}
        hasFilters={page.hasFilters}
        page={page.page}
        total={page.total}
        isActionBusy={page.isActionBusy}
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
    </div>
  )
}
