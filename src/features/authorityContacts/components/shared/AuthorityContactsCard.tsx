import { ConfirmDialog } from '../../../../components/ui/overlays/ConfirmDialog'
import { PaginationCard } from '../../../../components/ui/table/PaginationCard'
import { useAuthorityContacts } from '../../hooks/useAuthorityContacts'
import { useAuthorityContactsCardState } from '../../hooks/useAuthorityContactsCardState'
import { AuthorityContactModal } from '../form/AuthorityContactModal'
import { AuthorityContactsListCard } from '../list/AuthorityContactsListCard'
import { AUTHORITY_CONTACT_TEXT } from '../../constants'

interface AuthorityContactsCardProps {
  clientId: number
}

export const AuthorityContactsCard: React.FC<AuthorityContactsCardProps> = ({ clientId }) => {
  const { contacts, total, page, setPage, totalPages, isLoading, error, retry, deleteContact, deletingId } =
    useAuthorityContacts(clientId)
  const { editing, isModalOpen, confirmDeleteId, openCreate, openEdit, closeModal, requestDelete, clearDeleteRequest } =
    useAuthorityContactsCardState()

  const handleConfirmDelete = async () => {
    if (confirmDeleteId === null) {
      return
    }
    try {
      await deleteContact(confirmDeleteId)
      clearDeleteRequest()
    } catch {
      // Error toast is handled by the mutation hook; keep the dialog open for retry.
    }
  }

  return (
    <div className="space-y-4">
      <AuthorityContactsListCard
        contacts={contacts}
        total={total}
        isLoading={isLoading}
        error={error}
        deletingId={deletingId}
        onRetry={retry}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={requestDelete}
      />

      {totalPages > 1 && (
        <PaginationCard
          page={page}
          totalPages={totalPages}
          total={total}
          label={AUTHORITY_CONTACT_TEXT.paginationLabel}
          onPageChange={setPage}
        />
      )}

      <AuthorityContactModal open={isModalOpen} clientId={clientId} existing={editing} onClose={closeModal} />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title={AUTHORITY_CONTACT_TEXT.deleteTitle}
        message={AUTHORITY_CONTACT_TEXT.deleteMessage}
        confirmLabel={AUTHORITY_CONTACT_TEXT.deleteConfirm}
        cancelLabel={AUTHORITY_CONTACT_TEXT.cancel}
        confirmVariant="danger"
        isLoading={deletingId === confirmDeleteId}
        onConfirm={handleConfirmDelete}
        onCancel={clearDeleteRequest}
      />
    </div>
  )
}
