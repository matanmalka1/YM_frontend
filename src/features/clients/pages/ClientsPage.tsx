import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import {
  ClientEditDrawer,
  ClientsFiltersBar,
  ClientsStatsSection,
  CreateClientModal,
  DeletedClientDialog,
  useClientsPage,
} from '@/features/clients'
import { ImportExportModal } from '@/features/importExport'

export const Clients: React.FC = () => {
  const { status, isEmptyState, headerProps, stats, filters, table, drawers, modals, permissions } = useClientsPage()

  const header = (
    <PageHeader
      {...headerProps}
      actions={
        isEmptyState ? undefined : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={modals.openImportExport}>
              ייבוא / ייצוא
            </Button>
            {permissions.can.createClients && (
              <Button variant="ghost" size="sm" onClick={modals.openCreate}>
                לקוח חדש
                <Plus className="h-3.5 w-3.5" />
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
      {!permissions.can.editClients && (
        <Alert variant="info" message="צפייה בלבד. יצירה ועריכה של לקוחות זמינה ליועצים בלבד." />
      )}
      {!isEmptyState && (
        <>
          <ClientsStatsSection
            stats={stats.values}
            selectedEntityType={stats.selected}
            onEntityTypeClick={stats.onEntityTypeClick}
          />
          <ClientsFiltersBar
            filters={filters.values}
            onFilterChange={filters.onFilterChange}
            onReset={filters.resetFilters}
            showAccountantFilter={filters.showAccountantFilter}
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
        onPageSizeChange={table.pagination.onPageSizeChange}
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
