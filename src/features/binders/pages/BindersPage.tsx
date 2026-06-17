import { useState } from 'react'
import { Button } from '@/components/ui/primitives/Button'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import {
  BinderDetailDrawer,
  BindersFiltersBar,
  BindersStatsSection,
  ReceiveBinderDrawer,
  useBindersPage,
  useReceiveBinderDrawer,
} from '@/features/binders'
import { BindersPageDialogs } from '../components/dialogs/BindersPageDialogs'
import { getBinderNumberLabel } from '../utils'
import { Plus } from 'lucide-react'

export const Binders: React.FC = () => {
  const [receiveOpen, setReceiveOpen] = useState(false)

  const page = useBindersPage({ onOpenReceive: () => setReceiveOpen(true) })
  const { status, stats, filters, table, modals, drawers } = page
  const { dialogs } = modals

  const receive = useReceiveBinderDrawer({
    onSuccess: () => setReceiveOpen(false),
  })

  const header = (
    <PageHeader
      {...page.headerProps}
      actions={
        <Button variant="ghost" size="sm" onClick={() => setReceiveOpen(true)}>
          קליטת חומר
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
      <BindersStatsSection
        counters={stats.counters}
        countersLoading={stats.countersLoading}
        locationStatus={stats.locationStatus}
        onFilterChange={stats.onFilterChange}
      />

      <BindersFiltersBar
        filters={filters.values}
        onFilterChange={filters.onFilterChange}
        onMultiFilterChange={filters.onMultiFilterChange}
        onReset={filters.resetFilters}
      />

      <PaginatedDataTable
        data={table.data}
        columns={table.columns}
        getRowKey={(binder) => binder.id}
        onRowClick={(binder) => drawers.onSelect(binder)}
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

      <BindersPageDialogs
        confirmHandoverForId={dialogs.confirmHandoverForId}
        confirmDeleteForId={dialogs.confirmDeleteForId}
        confirmReadyForHandoverForId={dialogs.confirmReadyForHandoverForId}
        handoverRecipientName={dialogs.handoverRecipientName}
        setHandoverRecipientName={dialogs.setHandoverRecipientName}
        isHandingOverToClient={modals.isHandingOverToClient}
        isDeleting={modals.isDeleting}
        isMarkingReadyForHandover={modals.isMarkingReadyForHandover}
        onConfirmHandoverToClient={() => void dialogs.confirmHandoverToClient()}
        onCancelHandoverToClient={dialogs.closeHandoverToClientDialog}
        onConfirmDelete={() => void dialogs.confirmDelete()}
        onCancelDelete={dialogs.closeDeleteDialog}
        onConfirmReadyForHandover={() => void dialogs.confirmReadyForHandover()}
        onCancelReadyForHandover={dialogs.closeReadyForHandoverDialog}
        getBinderNumberLabel={(id) => getBinderNumberLabel(id, table.data, drawers.selectedBinder)}
        bulkReadyForHandoverOpen={dialogs.bulkReadyForHandoverOpen}
        onCloseBulkReadyForHandover={dialogs.closeBulkReadyForHandoverDialog}
        onConfirmBulkReadyForHandover={() => void dialogs.confirmBulkReadyForHandover()}
        bulkReadyForHandoverYear={dialogs.bulkReadyForHandoverYear}
        bulkReadyForHandoverMonth={dialogs.bulkReadyForHandoverMonth}
        setBulkReadyForHandoverYear={dialogs.setBulkReadyForHandoverYear}
        setBulkReadyForHandoverMonth={dialogs.setBulkReadyForHandoverMonth}
        isMarkingReadyForHandoverBulk={modals.isMarkingReadyForHandoverBulk}
        dialogBinder={dialogs.dialogBinder}
        handoverToClientBulkOpen={dialogs.handoverToClientBulkOpen}
        onCloseHandoverToClientBulk={dialogs.closeHandoverToClientBulkDialog}
        onSubmitHandoverToClientBulk={dialogs.submitHandoverToClientBulk}
        isHandingOverToClientBulk={modals.isHandingOverToClientBulk}
      />

      <BinderDetailDrawer
        open={drawers.detailOpen}
        binder={drawers.selectedBinder}
        onClose={drawers.onCloseDetail}
        onReceiveMaterial={
          drawers.selectedBinder ? () => void drawers.receiveMaterial(drawers.selectedBinder!.id) : undefined
        }
        onMarkFull={drawers.selectedBinder ? () => void drawers.markFull(drawers.selectedBinder!.id) : undefined}
        onReopenCapacity={
          drawers.selectedBinder ? () => void drawers.reopenCapacity(drawers.selectedBinder!.id) : undefined
        }
        onMarkReadyForHandover={
          drawers.selectedBinder ? () => dialogs.openReadyForHandoverDialog(drawers.selectedBinder!.id) : undefined
        }
        onMarkReadyForHandoverBulk={
          drawers.selectedBinder ? () => dialogs.openBulkReadyForHandoverDialog(drawers.selectedBinder!) : undefined
        }
        onRevertReadyForHandover={
          drawers.selectedBinder ? () => void drawers.revertReadyForHandover(drawers.selectedBinder!.id) : undefined
        }
        onHandoverToClient={
          drawers.selectedBinder ? () => dialogs.openHandoverToClientDialog(drawers.selectedBinder!.id) : undefined
        }
        onHandoverToClientBulk={
          drawers.selectedBinder ? () => dialogs.openHandoverToClientBulkDialog(drawers.selectedBinder!) : undefined
        }
        onDelete={drawers.selectedBinder ? () => dialogs.openDeleteDialog(drawers.selectedBinder!.id) : undefined}
        actionLoading={drawers.selectedBinder ? drawers.actionLoadingId === drawers.selectedBinder.id : false}
      />

      <ReceiveBinderDrawer
        open={receiveOpen}
        onClose={() => {
          receive.handleReset()
          setReceiveOpen(false)
        }}
        form={receive.form}
        clientQuery={receive.clientQuery}
        selectedClient={receive.selectedClient}
        businesses={receive.businesses}
        annualReports={receive.annualReports}
        hasActiveBinder={receive.hasActiveBinder}
        vatType={receive.vatType}
        onClientSelect={receive.handleClientSelect}
        onClientQueryChange={receive.handleClientQueryChange}
        onSubmit={receive.handleSubmit}
        isSubmitting={receive.isSubmitting}
      />
    </PageStateGuard>
  )
}
