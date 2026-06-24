import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { Button } from '@/components/ui/primitives/Button'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import {
  ChargesCreateModal,
  ChargeDetailDrawer,
  ChargesStatsSection,
  ChargesTableBlock,
  useChargesPage,
} from '@/features/charges'
import { SendNotificationModal } from '@/features/notifications'
import { CHARGES_MESSAGES } from '../messages'

export const Charges: React.FC = () => {
  const { status, headerProps, stats, filters, table, drawers, modals, permissions } = useChargesPage()

  const header = (
    <PageHeader
      {...headerProps}
      actions={
        <div className="flex items-center gap-2">
          {permissions.isAdvisor && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              iconPosition="end"
              onClick={table.onCreateCharge}
            >
              {CHARGES_MESSAGES.list.newCharge}
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
      <ChargesStatsSection stats={stats.stats} isAdvisor={stats.isAdvisor} />

      <FilterPanel
        {...filters}
        title={CHARGES_MESSAGES.list.filterTitle}
        subtitle={CHARGES_MESSAGES.list.filterSubtitle}
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
