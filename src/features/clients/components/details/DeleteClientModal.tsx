import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { Button } from '../../../../components/ui/primitives/Button'
import { Input } from '../../../../components/ui/inputs/Input'
import { CLIENTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface Props {
  open: boolean
  clientName: string
  isDeleting: boolean
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export const DeleteClientModal: React.FC<Props> = ({ open, clientName, isDeleting, onConfirm, onCancel }) => {
  const [confirmation, setConfirmation] = useState('')

  const handleClose = () => {
    setConfirmation('')
    onCancel()
  }

  const handleConfirm = async () => {
    await onConfirm()
    setConfirmation('')
  }

  return (
    <Modal
      open={open}
      title={CLIENTS_MESSAGES.deleteClient.modalTitle}
      onClose={handleClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isDeleting}>
            {GLOBAL_UI_MESSAGES.actions.cancel}
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={isDeleting}
            disabled={isDeleting || confirmation !== clientName}
            onClick={handleConfirm}
            className="bg-negative-600 hover:bg-negative-700 focus:ring-negative-500"
          >
            {CLIENTS_MESSAGES.deleteClient.confirmButton}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-3 rounded-lg border border-negative-200 bg-negative-50 p-4 text-negative-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold">{CLIENTS_MESSAGES.deleteClient.irreversibleWarning(clientName)}</p>
            <p>{CLIENTS_MESSAGES.deleteClient.impactDescription}</p>
          </div>
        </div>
        <Input
          label={CLIENTS_MESSAGES.deleteClient.confirmInputLabel}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          disabled={isDeleting}
        />
      </div>
    </Modal>
  )
}
