import { Button } from '@/components/ui/primitives/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { useBindersPage } from '../hooks/useBindersPage'
import { Plus } from 'lucide-react'
import { BINDERS_MESSAGES } from '../messages'
import { BindersWorkspaceBody } from '../components/shared/BindersWorkspaceBody'

export const Binders: React.FC = () => {
  const model = useBindersPage()
  const { status, headerProps, drawers } = model

  const header = (
    <PageHeader
      {...headerProps}
      actions={
        <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={drawers.openReceive}>
          {BINDERS_MESSAGES.actions.intake}
        </Button>
      }
    />
  )

  return (
    <PageStateGuard isLoading={status.isLoading} error={status.error} header={header} loadingMessage={status.loadingMessage}>
      <BindersWorkspaceBody model={model} />
    </PageStateGuard>
  )
}
