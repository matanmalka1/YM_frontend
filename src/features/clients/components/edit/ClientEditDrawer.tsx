import { Alert } from '@/components/ui/overlays/Alert'
import { DetailDrawer } from '@/components/ui/overlays/DetailDrawer'
import { ModalFormActions } from '@/components/ui/overlays/ModalFormActions'
import type { ClientRecordResponse, UpdateClientPayload } from '../../api'
import { ClientEditForm } from './ClientEditForm'

interface ClientEditDrawerProps {
  open: boolean
  onClose: () => void
  client: ClientRecordResponse | null
  isLoading: boolean
  error: string | null
  onSave: (payload: UpdateClientPayload) => Promise<void>
  updateLoading: boolean
  formId: string
}

export const ClientEditDrawer = ({
  open,
  onClose,
  client,
  isLoading,
  error,
  onSave,
  updateLoading,
  formId,
}: ClientEditDrawerProps) => {
  if (!open) return null

  return (
    <DetailDrawer
      open
      onClose={onClose}
      title="עריכת לקוח"
      footer={
        client ? (
          <ModalFormActions
            onCancel={onClose}
            isLoading={updateLoading}
            submitLabel="שמור שינויים"
            submitType="submit"
            submitForm={formId}
          />
        ) : undefined
      }
    >
      {isLoading && <Alert variant="info" message="טוען את פרטי הלקוח..." />}
      {error && <Alert variant="error" message={error} />}
      {client && (
        <ClientEditForm
          client={client}
          formId={formId}
          onSave={onSave}
          onCancel={onClose}
          isLoading={updateLoading}
          hideFooter
        />
      )}
    </DetailDrawer>
  )
}

ClientEditDrawer.displayName = 'ClientEditDrawer'
