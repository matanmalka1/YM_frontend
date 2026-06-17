import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Button } from '@/components/ui/primitives/Button'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import { TaskModal } from '@/features/tasks'
import { useWorkQueuePage } from '../hooks/useWorkQueuePage'
import { WorkQueueSummaryCards } from '../components/WorkQueueSummaryCards'
import { WorkQueueFiltersBar } from '../components/WorkQueueFiltersBar'

export const WorkQueuePage: React.FC = () => {
  const { status, headerProps, stats, filters, table, modals } = useWorkQueuePage()

  const header = (
    <PageHeader
      {...headerProps}
      actions={
        <Button size="sm" variant="ghost" data-work-queue-focus-fallback="true" onClick={modals.openCreateTask}>
          משימה חדשה
          <Plus className="h-3.5 w-3.5" />
        </Button>
      }
    />
  )

  return (
    <PageStateGuard
      isLoading={status.isLoading}
      error={status.error}
      header={header}
      loadingMessage={status.loadingMessage}
    >
      <WorkQueueSummaryCards {...stats} />

      <WorkQueueFiltersBar {...filters} />

      <PaginatedDataTable
        data={table.data}
        columns={table.columns}
        getRowKey={(item) => item.id}
        isLoading={table.isLoading}
        isFetching={table.isFetching}
        page={table.pagination.page}
        pageSize={table.pagination.pageSize}
        total={table.pagination.total}
        label={table.label}
        onPageChange={table.pagination.onPageChange}
        showPagination={table.showPagination}
        emptyState={{
          icon: table.emptyState.icon,
          variant: table.emptyState.variant,
          title: table.emptyState.title,
          message: table.emptyState.message,
        }}
      />

      <ConfirmDialog {...modals.confirmProps} />

      {modals.taskModalProps && <TaskModal {...modals.taskModalProps} />}
    </PageStateGuard>
  )
}
