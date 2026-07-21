import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { DetailTabPanel } from '@/components/ui/layout'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { DetailDrawer } from '@/components/ui/overlays/DetailDrawer'
import { PaginatedDataTable } from '@/components/ui/table'
import { useBindersPage } from '../../hooks/useBindersPage'
import { BindersStatsSection } from '../list/BindersStatsSection'
import { BinderDetailDrawer } from '../drawer/BinderDetailDrawer'
import { BinderReceivePanel } from '../drawer/BinderReceivePanel'
import { BindersPageDialogs } from '../dialogs/BindersPageDialogs'
import { BINDERS_MESSAGES } from '../../messages'

interface ClientBindersTabProps {
  clientId: number
  clientName: string
}

export const ClientBindersTab: React.FC<ClientBindersTabProps> = ({ clientId, clientName }) => {
  const { status, stats, filters, table, modals, drawers } = useBindersPage({
    pinnedClient: { id: clientId, name: clientName },
  })

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
      <PaginatedDataTable
        data={table.data}
        columns={table.columns}
        error={status.error}
        getRowKey={(binder) => binder.id}
        onRowClick={table.onRowClick}
        isLoading={status.isLoading}
        isFetching={status.isFetching}
        page={table.pagination.page}
        pageSize={table.pagination.pageSize}
        total={table.pagination.total}
        label={BINDERS_MESSAGES.clientTab.title}
        onPageChange={table.pagination.onPageChange}
        emptyMessage={table.emptyState.emptyMessage}
        emptyState={{
          title: BINDERS_MESSAGES.clientTab.emptyTitle,
          message: BINDERS_MESSAGES.clientTab.emptyMessage,
          action: { label: BINDERS_MESSAGES.actions.intake, onClick: drawers.openReceive },
        }}
      />

      <BindersPageDialogs {...modals.dialogsProps} />

      <BinderDetailDrawer {...drawers.detail} />

      <DetailDrawer
        open={drawers.receive.open}
        title={BINDERS_MESSAGES.page.receiveDrawerTitle}
        onClose={drawers.receive.onClose}
        isDirty={drawers.receive.form.formState.isDirty}
      >
        <BinderReceivePanel {...drawers.receive} />
      </DetailDrawer>
    </DetailTabPanel>
  )
}

ClientBindersTab.displayName = 'ClientBindersTab'
