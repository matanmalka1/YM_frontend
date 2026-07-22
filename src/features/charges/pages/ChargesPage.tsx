import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { Button } from '@/components/ui/primitives/Button'
import { useChargesPage } from '../hooks/useChargesPage'
import { CHARGES_MESSAGES } from '../messages'
import { ChargesWorkspaceBody } from '../components/shared/ChargesWorkspaceBody'

export const Charges: React.FC = () => {
  const model = useChargesPage()
  const { status, headerProps, table, permissions } = model

  const header = (
    <PageHeader
      {...headerProps}
      actions={
        <div className="flex items-center gap-2">
          {permissions.canManageCharges && (
            <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={table.onCreateCharge}>
              {CHARGES_MESSAGES.list.newCharge}
            </Button>
          )}
        </div>
      }
    />
  )

  return (
    <PageStateGuard isLoading={status.isLoading} error={status.error} header={header} loadingMessage={status.loadingMessage}>
      <ChargesWorkspaceBody model={model} />
    </PageStateGuard>
  )
}
