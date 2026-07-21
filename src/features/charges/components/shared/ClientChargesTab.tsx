import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { DetailTabPanel } from '@/components/ui/layout'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { SendNotificationModal } from '@/features/notifications'
import { useChargesPage } from '../../hooks/useChargesPage'
import { ChargesCreateModal } from '../form/ChargesCreateModal'
import { ChargesStatsSection } from '../list/ChargesStatsSection'
import { ChargesTableBlock } from '../list/ChargesTableBlock'
import { CHARGES_MESSAGES } from '../../messages'

interface ClientChargesTabProps {
  clientId: number
  clientName: string
}

export const ClientChargesTab: React.FC<ClientChargesTabProps> = ({ clientId, clientName }) => {
  const { status, stats, filters, table, modals, permissions } = useChargesPage({
    pinnedClient: { id: clientId, name: clientName },
  })

  return (
    <DetailTabPanel
      title={CHARGES_MESSAGES.list.title}
      subtitle={CHARGES_MESSAGES.list.clientTabSubtitle}
      actions={
        permissions.isAdvisor ? (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={table.onCreateCharge}
            className="whitespace-nowrap"
          >
            {CHARGES_MESSAGES.list.newCharge}
          </Button>
        ) : null
      }
      summary={<ChargesStatsSection stats={stats.stats} isAdvisor={stats.isAdvisor} />}
      filters={
        <FilterPanel {...filters} title={CHARGES_MESSAGES.list.filterTitle} subtitle={CHARGES_MESSAGES.list.filterSubtitle} />
      }
    >
      <ChargesTableBlock
        charges={table.data}
        columns={table.columns}
        error={status.error}
        isAdvisor={permissions.isAdvisor}
        loading={status.isLoading}
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

      {modals.notificationProps && <SendNotificationModal {...modals.notificationProps} />}
    </DetailTabPanel>
  )
}
