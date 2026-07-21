import { Bell, Send } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { DetailTabPanel } from '@/components/ui/layout'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { PaginatedDataTable } from '@/components/ui/table'
import { SendNotificationModal } from '../form/SendNotificationModal'
import { NotificationDetailDrawer } from '../drawer/NotificationDetailDrawer'
import { useNotificationsPage } from '../../hooks/useNotificationsPage'
import type { NotificationsTabProps } from '../../types'
import { NOTIFICATIONS_MESSAGES } from '../../messages'

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ clientRecordId, clientName }) => {
  const { status, permissions, filters, table, drawers, modals } = useNotificationsPage({
    pinnedClient: { id: clientRecordId, name: clientName },
  })

  return (
    <DetailTabPanel
      title={NOTIFICATIONS_MESSAGES.tab.title}
      subtitle={NOTIFICATIONS_MESSAGES.tab.subtitle}
      actions={
        <div className="flex items-center gap-2">
          <FilterPanel
            {...filters}
            title={NOTIFICATIONS_MESSAGES.page.filterTitle}
            subtitle={NOTIFICATIONS_MESSAGES.page.filterSubtitle}
          />
          {permissions.isAdvisor && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Send className="h-4 w-4" />}
              onClick={() => modals.openSend()}
            >
              {NOTIFICATIONS_MESSAGES.actions.sendMessageShort}
            </Button>
          )}
        </div>
      }
    >
      <PaginatedDataTable
        data={table.data}
        columns={table.columns}
        error={status.error}
        getRowKey={(item) => item.id}
        onRowClick={table.onRowClick}
        isLoading={status.isLoading}
        isFetching={status.isFetching}
        page={table.pagination.page}
        pageSize={table.pagination.pageSize}
        total={table.pagination.total}
        label={table.label}
        onPageChange={table.pagination.onPageChange}
        showPagination={table.showPagination}
        emptyState={{ icon: Bell, message: NOTIFICATIONS_MESSAGES.tab.emptyClient }}
      />

      <NotificationDetailDrawer {...drawers.detail} />

      {permissions.isAdvisor && <SendNotificationModal {...modals.sendProps} />}
    </DetailTabPanel>
  )
}
NotificationsTab.displayName = 'NotificationsTab'
