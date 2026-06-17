import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import {
  AuditLogsDrawer,
  CreateUserModal,
  EditUserModal,
  ResetPasswordModal,
  useUsersPage,
  UsersFiltersBar,
} from '@/features/users'
import { Plus } from 'lucide-react'

export const Users: React.FC = () => {
  const { status, headerProps, filters, table, modals, permissions } = useUsersPage()

  if (!permissions.isAdvisor) {
    return (
      <div className="space-y-6">
        <PageHeader title="ניהול משתמשים" description="ניהול חשבונות משתמשים במערכת" />
        <Alert variant="warning" message="גישה לניהול משתמשים זמינה ליועצים בלבד." />
      </div>
    )
  }

  const header = (
    <PageHeader
      {...headerProps}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={modals.openAuditLogs}>
            לוג ביקורת
          </Button>
          <Button variant="ghost" size="sm" onClick={modals.openCreate}>
            משתמש חדש
            <Plus className="h-4 w-4" />
          </Button>
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
      <UsersFiltersBar
        filters={filters.values}
        onFilterChange={filters.onFilterChange}
        onReset={filters.resetFilters}
      />
      <PaginatedDataTable
        data={table.data}
        columns={table.columns}
        getRowKey={(user) => user.id}
        page={table.pagination.page}
        pageSize={table.pagination.pageSize}
        total={table.pagination.total}
        onPageChange={table.pagination.onPageChange}
        onPageSizeChange={table.pagination.onPageSizeChange}
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
