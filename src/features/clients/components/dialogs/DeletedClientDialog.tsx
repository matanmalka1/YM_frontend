import { Alert } from '../../../../components/ui/overlays/Alert'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { Button } from '../../../../components/ui/primitives/Button'
import { formatDate } from '../../../../utils/utils'
import type { DeletedClientSummary } from '../../api'
import { CLIENTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface Props {
  open: boolean
  deletedClient: DeletedClientSummary | null
  isAdvisor: boolean
  onRestore: () => void
  onForceCreate: () => void
  onDismiss: () => void
  restoreLoading?: boolean
  forceCreateLoading?: boolean
}

export const DeletedClientDialog: React.FC<Props> = ({
  open,
  deletedClient,
  isAdvisor,
  onRestore,
  onForceCreate,
  onDismiss,
  restoreLoading = false,
  forceCreateLoading = false,
}) => {
  const isLoading = restoreLoading || forceCreateLoading

  if (!deletedClient) return null
  return (
    <Modal
      open={open}
      onClose={onDismiss}
      title={CLIENTS_MESSAGES.deletedClientDialog.title}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onDismiss} disabled={isLoading}>
            {GLOBAL_UI_MESSAGES.actions.cancel}
          </Button>
          <Button type="button" variant="outline" onClick={onForceCreate} isLoading={forceCreateLoading} disabled={isLoading}>
            {CLIENTS_MESSAGES.deletedClientDialog.createNew}
          </Button>
          {isAdvisor && (
            <Button type="button" variant="primary" onClick={onRestore} isLoading={restoreLoading} disabled={isLoading}>
              {CLIENTS_MESSAGES.deletedClientDialog.restore}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <Alert variant="warning" size="sm" message={CLIENTS_MESSAGES.deletedClientDialog.warning} />

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{CLIENTS_MESSAGES.deletedClientDialog.nameField}</span>
            <span className="font-medium text-gray-900">{deletedClient.full_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{CLIENTS_MESSAGES.deletedClientDialog.deletedAtField}</span>
            <span className="font-medium text-gray-900">{formatDate(deletedClient.deleted_at)}</span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">{CLIENTS_MESSAGES.deletedClientDialog.restoreExplanationLead}</span>
            {CLIENTS_MESSAGES.deletedClientDialog.restoreExplanationRest}
          </p>
          <p>
            <span className="font-medium">{CLIENTS_MESSAGES.deletedClientDialog.createExplanationLead}</span>
            {CLIENTS_MESSAGES.deletedClientDialog.createExplanationRest}
          </p>
          {!isAdvisor && <p className="text-warning-700">{CLIENTS_MESSAGES.deletedClientDialog.advisorOnlyNotice}</p>}
        </div>
      </div>
    </Modal>
  )
}
