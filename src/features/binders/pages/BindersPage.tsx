import { Button } from '@/components/ui/primitives/Button'
import { PaginatedDataTable } from '@/components/ui/table'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { DetailDrawer } from '@/components/ui/overlays/DetailDrawer'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { BinderDetailDrawer, BindersStatsSection, useBindersPage } from '@/features/binders'
import { BinderReceivePanel } from '../components/drawer/BinderReceivePanel'
import { BindersPageDialogs } from '../components/dialogs/BindersPageDialogs'
import { Plus } from 'lucide-react'
import { BINDERS_MESSAGES } from '../messages'

export const Binders: React.FC = () => {
  const { status, headerProps, stats, filters, table, modals, drawers } = useBindersPage()

  const header = (
    <PageHeader
      {...headerProps}
      actions={
        <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={drawers.openReceive}>
          {BINDERS_MESSAGES.actions.intake}
        </Button>
      }
    />
  )

  return (
    <PageStateGuard isLoading={status.isLoading} error={status.error} header={header} loadingMessage={status.loadingMessage}>
      <BindersStatsSection counters={stats.counters} countersLoading={stats.countersLoading} />

      <FilterPanel {...filters} title={BINDERS_MESSAGES.page.filterTitle} subtitle={BINDERS_MESSAGES.page.filterSubtitle} />

      <PaginatedDataTable
        data={table.data}
        columns={table.columns}
        getRowKey={(binder) => binder.id}
        onRowClick={table.onRowClick}
        page={table.pagination.page}
        pageSize={table.pagination.pageSize}
        total={table.pagination.total}
        onPageChange={table.pagination.onPageChange}
        emptyMessage={table.emptyState.emptyMessage}
        emptyState={{
          title: table.emptyState.title,
          message: table.emptyState.message,
          action: table.emptyState.action,
        }}
      />

      <BindersPageDialogs {...modals.dialogsProps} />

      <BinderDetailDrawer {...drawers.detail} />

      <DetailDrawer
        open={drawers.receive.open}
        title={BINDERS_MESSAGES.page.receiveDrawerTitle}
        onClose={drawers.receive.onClose}
        isDirty={drawers.receive.form.formState.isDirty}
      >
        <BinderReceivePanel {...drawers.receive} />
      </DetailDrawer>
    </PageStateGuard>
  )
}
