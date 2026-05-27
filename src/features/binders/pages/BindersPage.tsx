import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/primitives/Button'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  BinderDetailDrawer,
  buildBindersColumns,
  BindersFiltersBar,
  ReceiveBinderDrawer,
  useBindersPage,
  useReceiveBinderDrawer,
} from '@/features/binders'
import { BindersPageDialogs } from '../components/dialogs/BindersPageDialogs'
import { useBindersPageDialogs } from '../hooks/useBindersPageDialogs'
import { getBinderNumberLabel } from '../utils'
import { Plus } from 'lucide-react'

export const Binders: React.FC = () => {
  const [receiveOpen, setReceiveOpen] = useState(false)

  const {
    actionLoadingId,
    binders,
    total,
    counters,
    error,
    filters,
    deepLinkBinderId,
    selectedBinder,
    handleFilterChange,
    handleReset,
    setPage,
    handleSelectBinder,
    handleCloseDrawer,
    loading,
    deleteBinder,
    isDeleting,
    receiveMaterial,
    markFull,
    reopenCapacity,
    markReadyForHandover,
    markReadyForHandoverBulk,
    isMarkingReadyForHandoverBulk,
    revertReadyForHandover,
    handoverToClient,
    isHandingOverToClient,
    handoverToClientBulk,
    isHandingOverToClientBulk,
  } = useBindersPage()

  const dialogs = useBindersPageDialogs({
    getSelectedBinder: () => selectedBinder,
    markReadyForHandoverBulk,
    handoverToClient,
    handoverToClientBulk,
    deleteBinder,
  })

  const receive = useReceiveBinderDrawer({
    onSuccess: () => setReceiveOpen(false),
  })

  const detailOpen = deepLinkBinderId !== undefined

  const columns = useMemo(
    () =>
      buildBindersColumns({
        actionLoadingId,
        onReceiveMaterial: (id) => void receiveMaterial(id),
        onMarkFull: (id) => void markFull(id),
        onReopenCapacity: (id) => void reopenCapacity(id),
        onMarkReadyForHandover: (id) => void markReadyForHandover(id),
        onMarkReadyForHandoverBulk: (id) => {
          const binder = binders.find((item) => item.id === id) ?? null
          dialogs.openBulkReadyForHandoverDialog(binder ?? undefined)
        },
        onRevertReadyForHandover: (id) => void revertReadyForHandover(id),
        onHandoverToClient: dialogs.openHandoverToClientDialog,
        onHandoverToClientBulk: (id) => {
          const binder = binders.find((item) => item.id === id) ?? null
          dialogs.openHandoverToClientBulkDialog(binder ?? undefined)
        },
        onOpenDetail: (id) => handleSelectBinder({ id }),
        onDelete: dialogs.openDeleteDialog,
      }),
    [
      actionLoadingId,
      binders,
      dialogs,
      receiveMaterial,
      markFull,
      reopenCapacity,
      markReadyForHandover,
      revertReadyForHandover,
      handleSelectBinder,
    ],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="קלסרים"
        description="רשימת הקלסרים במשרד — סינון לפי סטטוס, תקופה וחיפוש חופשי"
        actions={
          <Button variant="ghost" size="sm" onClick={() => setReceiveOpen(true)}>
            קליטת חומר
            <Plus className="h-3.5 w-3.5" />
          </Button>
        }
      />

      <BindersFiltersBar
        filters={filters}
        counters={counters}
        countersLoading={loading && total === 0}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <PaginatedDataTable
        data={binders}
        columns={columns}
        getRowKey={(binder) => binder.id}
        isLoading={loading}
        error={error}
        onRowClick={(binder) => handleSelectBinder(binder)}
        page={filters.page}
        pageSize={filters.page_size}
        total={total}
        onPageChange={setPage}
        emptyMessage="אין קלסרים התואמים לסינון הנוכחי"
        emptyState={{
          title: 'לא נמצאו קלסרים',
          message: 'נסה לאפס את הסינון, או קלוט חומר חדש.',
          action: { label: 'קליטת חומר', onClick: () => setReceiveOpen(true) },
        }}
      />

      <BindersPageDialogs
        confirmHandoverForId={dialogs.confirmHandoverForId}
        confirmDeleteForId={dialogs.confirmDeleteForId}
        handoverRecipientName={dialogs.handoverRecipientName}
        setHandoverRecipientName={dialogs.setHandoverRecipientName}
        isHandingOverToClient={isHandingOverToClient}
        isDeleting={isDeleting}
        onConfirmHandoverToClient={() => void dialogs.confirmHandoverToClient()}
        onCancelHandoverToClient={dialogs.closeHandoverToClientDialog}
        onConfirmDelete={() => void dialogs.confirmDelete()}
        onCancelDelete={dialogs.closeDeleteDialog}
        getBinderNumberLabel={(id) => getBinderNumberLabel(id, binders, selectedBinder)}
        bulkReadyForHandoverOpen={dialogs.bulkReadyForHandoverOpen}
        onCloseBulkReadyForHandover={dialogs.closeBulkReadyForHandoverDialog}
        onConfirmBulkReadyForHandover={() => void dialogs.confirmBulkReadyForHandover()}
        bulkReadyForHandoverYear={dialogs.bulkReadyForHandoverYear}
        bulkReadyForHandoverMonth={dialogs.bulkReadyForHandoverMonth}
        setBulkReadyForHandoverYear={dialogs.setBulkReadyForHandoverYear}
        setBulkReadyForHandoverMonth={dialogs.setBulkReadyForHandoverMonth}
        isMarkingReadyForHandoverBulk={isMarkingReadyForHandoverBulk}
        dialogBinder={dialogs.dialogBinder}
        handoverToClientBulkOpen={dialogs.handoverToClientBulkOpen}
        onCloseHandoverToClientBulk={dialogs.closeHandoverToClientBulkDialog}
        onSubmitHandoverToClientBulk={dialogs.submitHandoverToClientBulk}
        isHandingOverToClientBulk={isHandingOverToClientBulk}
      />

      <BinderDetailDrawer
        open={detailOpen}
        binder={selectedBinder}
        onClose={handleCloseDrawer}
        onReceiveMaterial={selectedBinder ? () => void receiveMaterial(selectedBinder.id) : undefined}
        onMarkFull={selectedBinder ? () => void markFull(selectedBinder.id) : undefined}
        onReopenCapacity={selectedBinder ? () => void reopenCapacity(selectedBinder.id) : undefined}
        onMarkReadyForHandover={selectedBinder ? () => void markReadyForHandover(selectedBinder.id) : undefined}
        onMarkReadyForHandoverBulk={
          selectedBinder ? () => dialogs.openBulkReadyForHandoverDialog(selectedBinder) : undefined
        }
        onRevertReadyForHandover={selectedBinder ? () => void revertReadyForHandover(selectedBinder.id) : undefined}
        onHandoverToClient={selectedBinder ? () => dialogs.openHandoverToClientDialog(selectedBinder.id) : undefined}
        onHandoverToClientBulk={
          selectedBinder ? () => dialogs.openHandoverToClientBulkDialog(selectedBinder) : undefined
        }
        onDelete={selectedBinder ? () => dialogs.openDeleteDialog(selectedBinder.id) : undefined}
        actionLoading={selectedBinder ? actionLoadingId === selectedBinder.id : false}
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
    </div>
  )
}
