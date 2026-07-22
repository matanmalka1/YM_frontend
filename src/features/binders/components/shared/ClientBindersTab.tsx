import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { DetailTabPanel } from '@/components/ui/layout'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { useBindersPage } from '../../hooks/useBindersPage'
import { BindersStatsSection } from '../list/BindersStatsSection'
import { BINDERS_MESSAGES } from '../../messages'
import { BindersWorkspaceBody } from './BindersWorkspaceBody'

interface ClientBindersTabProps {
  clientId: number
  clientName: string
}

export const ClientBindersTab: React.FC<ClientBindersTabProps> = ({ clientId, clientName }) => {
  const model = useBindersPage({
    pinnedClient: { id: clientId, name: clientName },
  })
  const { stats, filters, drawers } = model

  return (
    <DetailTabPanel
      title={BINDERS_MESSAGES.clientTab.title}
      subtitle={BINDERS_MESSAGES.clientTab.subtitle}
      actions={
        <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={drawers.openReceive}>
          {BINDERS_MESSAGES.actions.intake}
        </Button>
      }
      summary={<BindersStatsSection counters={stats.counters} countersLoading={stats.countersLoading} />}
      filters={
        <FilterPanel {...filters} title={BINDERS_MESSAGES.page.filterTitle} subtitle={BINDERS_MESSAGES.page.filterSubtitle} />
      }
    >
      <BindersWorkspaceBody model={model} showStatsAndFilters={false} surfaceStatus clientScoped />
    </DetailTabPanel>
  )
}

ClientBindersTab.displayName = 'ClientBindersTab'
