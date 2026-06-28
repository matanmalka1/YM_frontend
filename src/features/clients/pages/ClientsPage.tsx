import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { PaginatedDataTable } from '@/components/ui/table'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import {
  ClientEditDrawer,
  ClientsStatsSection,
  CreateClientModal,
  DeletedClientDialog,
  useClientsPage,
} from '@/features/clients'
import { ImportExportModal } from '@/features/importExport'
import { CLIENTS_MESSAGES } from '../messages'

export const Clients: React.FC = () => {
  const { status, isEmptyState, headerProps, stats, filters, table, drawers, modals, permissions } = useClientsPage()

  const header = (
    <PageHeader
      {...headerProps}
      actions={
        isEmptyState ? undefined : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={modals.openImportExport}>
              {CLIENTS_MESSAGES.list.importExport}
            </Button>
            {permissions.can.createClients && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                iconPosition="end"
                onClick={modals.openCreate}
              >
                {CLIENTS_MESSAGES.list.newClient}
              </Button>
            )}
          </div>
        )
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
      {!permissions.can.editClients && <Alert variant="info" message={CLIENTS_MESSAGES.list.viewOnlyNotice} />}
      {!isEmptyState && (
        <>
          <ClientsStatsSection stats={stats.values} />
          <FilterPanel
            {...filters}
            title={CLIENTS_MESSAGES.list.filterTitle}
            subtitle={CLIENTS_MESSAGES.list.filterSubtitle}
          />
        </>
      )}
      <PaginatedDataTable
        data={table.data}
        columns={table.columns}
        getRowKey={(client) => client.id}
        onRowClick={table.onRowClick}
        page={table.pagination.page}
        pageSize={table.pagination.pageSize}
        total={table.pagination.total}
        onPageChange={table.pagination.onPageChange}
        emptyState={{
          icon: table.emptyState.icon,
          variant: table.emptyState.variant,
          title: table.emptyState.title,
          message: table.emptyState.message,
          action: table.emptyState.action,
          secondaryAction: table.emptyState.secondaryAction,
        }}
      />
      <CreateClientModal {...modals.createProps} />
      <ImportExportModal {...modals.importExportProps} />
      <DeletedClientDialog {...modals.deletedClientProps} />
      <ClientEditDrawer {...drawers.edit} />
    </PageStateGuard>
  )
}
