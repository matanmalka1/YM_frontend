import { ConfirmDialog } from '../../../components/ui/overlays/ConfirmDialog'
import { AUTHORITY_CONTACT_TEXT } from '../constants'

interface AuthorityContactDeleteDialogProps {
  confirmDeleteId: number | null
  deletingId: number | null
  onCancel: () => void
  onConfirm: (id: number) => Promise<unknown>
}

export const AuthorityContactDeleteDialog: React.FC<AuthorityContactDeleteDialogProps> = ({
  confirmDeleteId,
  deletingId,
  onCancel,
  onConfirm,
}) => {
  const isOpen = confirmDeleteId !== null

  const handleConfirm = async () => {
    if (confirmDeleteId === null) {
      return
    }
    try {
      await onConfirm(confirmDeleteId)
      onCancel()
    } catch {
      // Error toast is handled by the mutation hook; keep the dialog open for retry.
    }
  }

  return (
    <ConfirmDialog
      open={isOpen}
      title={AUTHORITY_CONTACT_TEXT.deleteTitle}
      message={AUTHORITY_CONTACT_TEXT.deleteMessage}
      confirmLabel={AUTHORITY_CONTACT_TEXT.deleteConfirm}
      cancelLabel={AUTHORITY_CONTACT_TEXT.cancel}
      confirmVariant="danger"
      isLoading={deletingId === confirmDeleteId}
      onConfirm={handleConfirm}
      onCancel={onCancel}
    />
  )
}
