import { ConfirmDialog } from '../../../components/ui/overlays/ConfirmDialog'
import { AUTHORITY_CONTACT_TEXT } from '../constants'

interface AuthorityContactDeleteDialogProps {
  confirmDeleteId: number | null
  deletingId: number | null
  onCancel: () => void
  onConfirm: (id: number) => void
}

export const AuthorityContactDeleteDialog: React.FC<AuthorityContactDeleteDialogProps> = ({
  confirmDeleteId,
  deletingId,
  onCancel,
  onConfirm,
}) => {
  const isOpen = confirmDeleteId !== null

  const handleConfirm = () => {
    if (confirmDeleteId === null) {
      return
    }
    onConfirm(confirmDeleteId)
    onCancel()
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
