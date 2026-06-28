import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Button } from '@/components/ui/primitives/Button'
import { PaginatedDataTable } from '@/components/ui/table'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { TaskModal } from '@/features/tasks'
import { useWorkQueuePage } from '../hooks/useWorkQueuePage'
import { WorkQueueStatsSection } from '../components/WorkQueueStatsSection'
import { WORK_QUEUE_MESSAGES } from '../messages'

export const WorkQueuePage: React.FC = () => {
  const { status, headerProps, stats, filters, table, modals } = useWorkQueuePage()

  const header = (
    <PageHeader
      {...headerProps}
      actions={
        <Button
          size="sm"
          variant="ghost"
          icon={<Plus className="h-3.5 w-3.5" />}
          iconPosition="end"
          data-work-queue-focus-fallback="true"
          onClick={modals.openCreateTask}
        >
          {WORK_QUEUE_MESSAGES.page.newTask}
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
      <WorkQueueStatsSection {...stats} />

      <FilterPanel
        {...filters}
        title={WORK_QUEUE_MESSAGES.page.filterTitle}
        subtitle={WORK_QUEUE_MESSAGES.page.filterSubtitle}
      />

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

      {modals.taskModalProps && (
        <TaskModal
          key={`${modals.taskModalProps.mode}-${modals.taskModalProps.task?.id ?? 'new'}-${modals.taskModalProps.source?.source_id ?? ''}`}
          {...modals.taskModalProps}
        />
      )}
    </PageStateGuard>
  )
}
