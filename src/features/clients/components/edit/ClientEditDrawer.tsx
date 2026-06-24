import { useState } from 'react'
import { Alert } from '@/components/ui/overlays/Alert'
import { DetailDrawer } from '@/components/ui/overlays/DetailDrawer'
import { ModalFormActions } from '@/components/ui/overlays/ModalFormActions'
import type { ClientRecordResponse, UpdateClientPayload } from '../../api'
import { ClientEditForm } from './ClientEditForm'
import { CLIENTS_MESSAGES } from '../../messages'

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
  const [isDirty, setIsDirty] = useState(false)

  if (!open) return null

  return (
    <DetailDrawer
      open
      onClose={onClose}
      isDirty={isDirty}
      title={CLIENTS_MESSAGES.edit.drawerTitle}
      footer={
        client ? (
          <ModalFormActions
            isLoading={updateLoading}
            submitLabel={CLIENTS_MESSAGES.edit.saveChanges}
            submitType="submit"
            submitForm={formId}
          />
        ) : undefined
      }
    >
      {isLoading && <Alert variant="info" message={CLIENTS_MESSAGES.edit.loadingClient} />}
      {error && <Alert variant="error" message={error} />}
      {client && (
        <ClientEditForm
          client={client}
          formId={formId}
          onSave={onSave}
          onCancel={onClose}
          isLoading={updateLoading}
          onDirtyChange={setIsDirty}
          hideFooter
        />
      )}
    </DetailDrawer>
  )
}

ClientEditDrawer.displayName = 'ClientEditDrawer'
