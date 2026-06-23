import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { Button } from '@/components/ui/primitives/Button'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import { SendNotificationModal } from '../components/form/SendNotificationModal'
import { NotificationDetailDrawer } from '../components/detail/NotificationDetailDrawer'
import { useNotificationsPage } from '../hooks/useNotificationsPage'

export const NotificationsPage: React.FC = () => {
  const { status, headerProps, permissions, filters, table, drawers, modals } = useNotificationsPage()

  const header = (
    <PageHeader
      {...headerProps}
      actions={
        permissions.isAdvisor ? (
          <Button variant="ghost" size="sm" onClick={() => modals.openSend()}>
            שליחת הודעה
            <Plus className="h-3.5 w-3.5" />
          </Button>
        ) : undefined
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
      <FilterPanel
        {...filters}
        title="סינון התראות"
        subtitle="לקוח, סוג, סטטוס, תאריך ושולח"
      />

      <PaginatedDataTable
        data={table.data}
        columns={table.columns}
        getRowKey={(item) => item.id}
        onRowClick={table.onRowClick}
        page={table.pagination.page}
        pageSize={table.pagination.pageSize}
        total={table.pagination.total}
        label={table.label}
        onPageChange={table.pagination.onPageChange}
        showPagination={table.showPagination}
        emptyMessage={table.emptyState.message}
        emptyState={table.emptyState}
      />

      <NotificationDetailDrawer {...drawers.detail} />

      {permissions.isAdvisor && <SendNotificationModal {...modals.sendProps} />}
    </PageStateGuard>
  )
}

NotificationsPage.displayName = 'NotificationsPage'
