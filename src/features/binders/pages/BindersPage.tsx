import { Button } from '@/components/ui/primitives/Button'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { DetailDrawer } from '@/components/ui/overlays/DetailDrawer'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { BinderDetailDrawer, BindersStatsSection, useBindersPage } from '@/features/binders'
import { BinderReceivePanel } from '../components/drawer/BinderReceivePanel'
import { BindersPageDialogs } from '../components/dialogs/BindersPageDialogs'
import { Plus } from 'lucide-react'

export const Binders: React.FC = () => {
  const { status, headerProps, stats, filters, table, modals, drawers } = useBindersPage()

  const header = (
    <PageHeader
      {...headerProps}
      actions={
        <Button
          variant="ghost"
          size="sm"
          icon={<Plus className="h-3.5 w-3.5" />}
          iconPosition="end"
          onClick={drawers.openReceive}
        >
          קליטת חומר
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
      <BindersStatsSection counters={stats.counters} countersLoading={stats.countersLoading} />

      <FilterPanel {...filters} title="סינון קלסרים" subtitle="לקוח, מספר, מיקום, קיבולת ושנה" />

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
        title="קליטת חומר מלקוח"
        onClose={drawers.receive.onClose}
        isDirty={drawers.receive.form.formState.isDirty}
      >
        <BinderReceivePanel {...drawers.receive} />
      </DetailDrawer>
    </PageStateGuard>
  )
}
