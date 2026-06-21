import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { Button } from '@/components/ui/primitives/Button'
import {
  ChargesCreateModal,
  ChargeDetailDrawer,
  ChargesFiltersCard,
  ChargesStatsSection,
  ChargesTableBlock,
  useChargesPage,
} from '@/features/charges'
import { SendNotificationModal } from '@/features/notifications'

export const Charges: React.FC = () => {
  const { status, headerProps, stats, filters, table, drawers, modals, permissions } = useChargesPage()

  const header = (
    <PageHeader
      {...headerProps}
      actions={
        <div className="flex items-center gap-2">
          {permissions.isAdvisor && (
            <Button variant="ghost" size="sm" onClick={table.onCreateCharge}>
              חיוב חדש
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
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
      <ChargesStatsSection
        stats={stats.stats}
        isAdvisor={stats.isAdvisor}
        currentStatus={stats.currentStatus}
        onStatusClick={stats.onStatusClick}
      />

      <ChargesFiltersCard
        filters={filters.values}
        onFilterChange={filters.onFilterChange}
        onClear={filters.resetFilters}
      />

      <ChargesTableBlock
        charges={table.data}
        columns={table.columns}
        isAdvisor={permissions.isAdvisor}
        page={table.pagination.page}
        pageSize={table.pagination.pageSize}
        total={table.pagination.total}
        selectedCount={table.selection.selectedCount}
        bulkLoading={table.selection.bulkLoading}
        onBulkAction={table.selection.onBulkAction}
        onClearSelection={table.selection.onClearSelection}
        onCreateCharge={table.onCreateCharge}
        onOpenCharge={table.onOpenCharge}
        onPageChange={table.pagination.onPageChange}
        onPageSizeChange={table.pagination.onPageSizeChange}
      />

      <ChargeDetailDrawer {...drawers.detail} />

      {modals.notificationProps && <SendNotificationModal {...modals.notificationProps} />}

      <ChargesCreateModal {...modals.createProps} />
    </PageStateGuard>
  )
}
