import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { SendNotificationModal } from '@/features/notifications'
import { useChargesPage } from '../../hooks/useChargesPage'
import { ChargesCreateModal } from '../form/ChargesCreateModal'
import { ChargesStatsSection } from '../list/ChargesStatsSection'
import { ChargesTableBlock } from '../list/ChargesTableBlock'
import { CHARGES_MESSAGES } from '../../messages'

interface ChargesWorkspaceBodyProps {
  model: ReturnType<typeof useChargesPage>
  showStatsAndFilters?: boolean
  surfaceStatus?: boolean
}

export const ChargesWorkspaceBody = ({ model, showStatsAndFilters = true, surfaceStatus = false }: ChargesWorkspaceBodyProps) => {
  const { status, stats, filters, table, modals, permissions } = model

  return (
    <>
      {showStatsAndFilters ? (
        <>
          <ChargesStatsSection stats={stats.stats} isAdvisor={stats.isAdvisor} />
          <FilterPanel {...filters} title={CHARGES_MESSAGES.list.filterTitle} subtitle={CHARGES_MESSAGES.list.filterSubtitle} />
        </>
      ) : null}

      <ChargesTableBlock
        charges={table.data}
        columns={table.columns}
        error={surfaceStatus ? status.error : undefined}
        loading={surfaceStatus ? status.isLoading : undefined}
        isAdvisor={permissions.canManageCharges}
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
      />

      <ChargesCreateModal {...modals.createProps} />
      {modals.notificationProps ? <SendNotificationModal {...modals.notificationProps} /> : null}
    </>
  )
}
