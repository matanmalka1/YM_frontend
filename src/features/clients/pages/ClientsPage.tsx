import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { DetailDrawer } from '@/components/ui/overlays/DetailDrawer'
import { ModalFormActions } from '@/components/ui/overlays/ModalFormActions'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import {
  buildClientColumns,
  ClientEditForm,
  ClientsFiltersBar,
  CreateClientModal,
  DeletedClientDialog,
  useClientsPage,
} from '@/features/clients'
import type { ClientRecordResponse } from '@/features/clients'
import { CLIENT_ROUTES } from '@/features/clients'
import { ImportExportModal } from '@/features/importExport'

const EDIT_FORM_ID = 'client-edit-form-list'

export const Clients: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientRecordResponse | null>(null)
  const {
    activeActionKey,
    clients,
    error,
    filters,
    handleFilterChange,
    handleReset,
    isAdvisor,
    loading,
    pendingAction,
    cancelPendingAction,
    confirmPendingAction,
    setPage,
    stats,
    total,
    createClient,
    createLoading,
    deletedClientInfo,
    deletedClientDialogOpen,
    handleRestoreClient,
    restoreDeletedClient,
    handleDismissDeletedDialog,
    restoreLoading,
    updateClient,
    updateLoading,
    can,
  } = useClientsPage()

  const columns = buildClientColumns({
    onEditClient: can.editClients ? (client) => setEditingClient(client) : undefined,
  })

  const hasActiveFilters = Boolean(filters.search || filters.status || filters.accountant_id)
  const isEmptyState = !loading && !error && total === 0 && !hasActiveFilters
  const emptyStateTitle = isEmptyState ? 'אין לקוחות במערכת עדיין' : 'לא נמצאו לקוחות'
  const emptyStateMessage =
    isEmptyState && can.createClients
      ? 'צור לקוח ראשון או ייבא רשימת לקוחות קיימת. יצירת לקוח תפתח אוטומטית קלסר ראשוני, מועדי מס רלוונטיים ותיק דוח שנתי לפי סוג הלקוח.'
      : 'לא נמצאו לקוחות התואמים את החיפוש או הסינון הנוכחי.'
  const emptyStateAction =
    isEmptyState && can.createClients ? { label: 'לקוח חדש', onClick: () => setShowCreateModal(true) } : undefined

  useEffect(() => {
    if (searchParams.get('create') !== '1' || !can.createClients) return
    setShowCreateModal(true)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('create')
    navigate({ search: nextParams.toString() }, { replace: true })
  }, [can.createClients, searchParams, navigate])

  const closeCreateModal = () => {
    setShowCreateModal(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="לקוחות"
        description={isEmptyState ? undefined : 'רשימת כל הלקוחות במערכת'}
        actions={
          isEmptyState ? undefined : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowImportExport(true)}>
                ייבוא / ייצוא
              </Button>
              {can.createClients && (
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(true)}>
                  לקוח חדש
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )
        }
      />
      {!can.editClients && <Alert variant="info" message="צפייה בלבד. יצירה ועריכה של לקוחות זמינה ליועצים בלבד." />}
      {!isEmptyState && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatsCard
              title="פעילים"
              value={stats.active}
              variant="green"
              selected={filters.status === 'active'}
              onClick={() => handleFilterChange('status', filters.status === 'active' ? '' : 'active')}
            />
            <StatsCard
              title="מוקפאים"
              value={stats.frozen}
              variant="orange"
              selected={filters.status === 'frozen'}
              onClick={() => handleFilterChange('status', filters.status === 'frozen' ? '' : 'frozen')}
            />
            <StatsCard
              title="סגורים"
              value={stats.closed}
              variant="neutral"
              selected={filters.status === 'closed'}
              onClick={() => handleFilterChange('status', filters.status === 'closed' ? '' : 'closed')}
            />
          </div>
          <ClientsFiltersBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            showAccountantFilter={can.editClients}
          />
        </>
      )}
      <PaginatedDataTable
        data={clients}
        columns={columns}
        getRowKey={(client) => client.id}
        onRowClick={(client) => navigate(CLIENT_ROUTES.detail(client.id))}
        isLoading={loading}
        error={error}
        page={filters.page}
        pageSize={filters.page_size}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => handleFilterChange('page_size', String(size))}
        emptyState={{
          icon: Users,
          variant: isEmptyState && can.createClients ? 'illustration' : 'default',
          title: emptyStateTitle,
          message: emptyStateMessage,
          action: emptyStateAction,
          secondaryAction:
            isEmptyState && can.createClients
              ? { label: 'ייבוא לקוחות', onClick: () => setShowImportExport(true) }
              : undefined,
        }}
      />
      <CreateClientModal
        open={showCreateModal && !deletedClientDialogOpen}
        onClose={closeCreateModal}
        onSubmit={createClient}
        onRestoreDeletedClient={async (clientId) => {
          const restored = await restoreDeletedClient(clientId)
          setShowCreateModal(false)
          navigate(CLIENT_ROUTES.detail(restored.id))
          return restored
        }}
        isAdvisor={isAdvisor}
        isLoading={createLoading}
        restoreLoading={restoreLoading}
      />
      <ImportExportModal open={showImportExport} onClose={() => setShowImportExport(false)} />
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.confirm?.title ?? 'אישור פעולה'}
        message={pendingAction?.confirm?.message ?? 'האם להמשיך?'}
        confirmLabel={pendingAction?.confirm?.confirmLabel ?? 'אישור'}
        cancelLabel={pendingAction?.confirm?.cancelLabel ?? 'ביטול'}
        isLoading={activeActionKey === pendingAction?.uiKey}
        onConfirm={confirmPendingAction}
        onCancel={cancelPendingAction}
      />
      <DeletedClientDialog
        open={deletedClientDialogOpen}
        deletedClient={deletedClientInfo}
        isAdvisor={isAdvisor}
        onRestore={handleRestoreClient}
        onForceCreate={handleDismissDeletedDialog}
        onDismiss={() => {
          handleDismissDeletedDialog()
          setShowCreateModal(true)
        }}
        restoreLoading={restoreLoading}
        forceCreateLoading={false}
      />
      {editingClient && (
        <DetailDrawer
          open
          onClose={() => setEditingClient(null)}
          title="עריכת לקוח"
          footer={
            <ModalFormActions
              onCancel={() => setEditingClient(null)}
              isLoading={updateLoading}
              submitLabel="שמור שינויים"
              submitType="submit"
              submitForm={EDIT_FORM_ID}
            />
          }
        >
          <ClientEditForm
            client={editingClient}
            formId={EDIT_FORM_ID}
            onSave={async (payload) => {
              await updateClient(editingClient.id, payload)
              setEditingClient(null)
            }}
            onCancel={() => setEditingClient(null)}
            isLoading={updateLoading}
            hideFooter
          />
        </DetailDrawer>
      )}
    </div>
  )
}
