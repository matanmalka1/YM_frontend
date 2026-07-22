import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { PaginatedDataTable } from '@/components/ui/table'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { AuditLogsDrawer } from '../components/drawer/AuditLogsDrawer'
import { CreateUserModal } from '../components/form/CreateUserModal'
import { EditUserModal } from '../components/form/EditUserModal'
import { ResetPasswordModal } from '../components/form/ResetPasswordModal'
import { useUsersPage } from '../hooks/useUsersPage'
import { Plus } from 'lucide-react'
import { USERS_MESSAGES } from '../messages'

export const Users: React.FC = () => {
  const { status, headerProps, filters, table, modals, permissions } = useUsersPage()

  if (!permissions.isAdvisor) {
    return (
      <PageContent>
        <PageHeader title={USERS_MESSAGES.page.title} description={USERS_MESSAGES.page.advisorOnlyDescription} />
        <Alert variant="warning" message={USERS_MESSAGES.page.advisorOnlyWarning} />
      </PageContent>
    )
  }

  const header = (
    <PageHeader
      {...headerProps}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={modals.openAuditLogs}>
            {USERS_MESSAGES.page.auditLog}
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={modals.openCreate}>
            {USERS_MESSAGES.page.newUser}
          </Button>
        </div>
      }
    />
  )

  return (
    <PageStateGuard isLoading={status.isLoading} error={status.error} header={header} loadingMessage={status.loadingMessage}>
      <FilterPanel {...filters} title={USERS_MESSAGES.page.filterTitle} subtitle={USERS_MESSAGES.page.filterSubtitle} />
      <PaginatedDataTable
        data={table.data}
        columns={table.columns}
        getRowKey={(user) => user.id}
        page={table.pagination.page}
        pageSize={table.pagination.pageSize}
        total={table.pagination.total}
        onPageChange={table.pagination.onPageChange}
        emptyState={{
          title: table.emptyState.title,
          message: table.emptyState.message,
          action: table.emptyState.action,
        }}
      />
      <CreateUserModal {...modals.createProps} />
      <EditUserModal {...modals.editProps} />
      <ResetPasswordModal {...modals.resetPasswordProps} />
      <AuditLogsDrawer {...modals.auditLogsProps} />
      <ConfirmDialog {...modals.toggleActiveProps} />
    </PageStateGuard>
  )
}
