import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { DetailTabPanel } from '@/components/ui/layout'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { useChargesPage } from '../../hooks/useChargesPage'
import { ChargesStatsSection } from '../list/ChargesStatsSection'
import { CHARGES_MESSAGES } from '../../messages'
import { ChargesWorkspaceBody } from './ChargesWorkspaceBody'

interface ClientChargesTabProps {
  clientId: number
  clientName: string
}

export const ClientChargesTab: React.FC<ClientChargesTabProps> = ({ clientId, clientName }) => {
  const model = useChargesPage({
    pinnedClient: { id: clientId, name: clientName },
  })
  const { stats, filters, table, permissions } = model

  return (
    <DetailTabPanel
      title={CHARGES_MESSAGES.list.title}
      subtitle={CHARGES_MESSAGES.list.clientTabSubtitle}
      actions={
        permissions.canManageCharges ? (
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
      <ChargesWorkspaceBody model={model} showStatsAndFilters={false} surfaceStatus />
    </DetailTabPanel>
  )
}
