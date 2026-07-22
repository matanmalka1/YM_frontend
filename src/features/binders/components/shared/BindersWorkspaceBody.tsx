import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { DetailDrawer } from '@/components/ui/overlays/DetailDrawer'
import { PaginatedDataTable } from '@/components/ui/table'
import { useBindersPage } from '../../hooks/useBindersPage'
import { BindersPageDialogs } from '../dialogs/BindersPageDialogs'
import { BinderDetailDrawer } from '../drawer/BinderDetailDrawer'
import { BinderReceivePanel } from '../drawer/BinderReceivePanel'
import { BindersStatsSection } from '../list/BindersStatsSection'
import { BINDERS_MESSAGES } from '../../messages'

interface BindersWorkspaceBodyProps {
  model: ReturnType<typeof useBindersPage>
  showStatsAndFilters?: boolean
  surfaceStatus?: boolean
  clientScoped?: boolean
}

export const BindersWorkspaceBody = ({
  model,
  showStatsAndFilters = true,
  surfaceStatus = false,
  clientScoped = false,
}: BindersWorkspaceBodyProps) => {
  const { status, stats, filters, table, modals, drawers } = model
  const emptyState = clientScoped
    ? {
        title: BINDERS_MESSAGES.clientTab.emptyTitle,
        message: BINDERS_MESSAGES.clientTab.emptyMessage,
        action: { label: BINDERS_MESSAGES.actions.intake, onClick: drawers.openReceive },
      }
    : table.emptyState

  return (
    <>
      {showStatsAndFilters ? (
        <>
          <BindersStatsSection counters={stats.counters} countersLoading={stats.countersLoading} />
          <FilterPanel {...filters} title={BINDERS_MESSAGES.page.filterTitle} subtitle={BINDERS_MESSAGES.page.filterSubtitle} />
        </>
      ) : null}

      <PaginatedDataTable
        data={table.data}
        columns={table.columns}
        error={surfaceStatus ? status.error : undefined}
        isLoading={surfaceStatus ? status.isLoading : undefined}
        isFetching={surfaceStatus ? status.isFetching : undefined}
        getRowKey={(binder) => binder.id}
        onRowClick={table.onRowClick}
        page={table.pagination.page}
        pageSize={table.pagination.pageSize}
        total={table.pagination.total}
        label={clientScoped ? BINDERS_MESSAGES.clientTab.title : undefined}
        onPageChange={table.pagination.onPageChange}
        emptyMessage={table.emptyState.emptyMessage}
        emptyState={emptyState}
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
    </>
  )
}
