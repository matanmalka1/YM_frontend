import { PaginationCard } from '../../../components/ui/table/PaginationCard'
import { useAuthorityContacts } from '../hooks/useAuthorityContacts'
import { useAuthorityContactsCardState } from '../hooks/useAuthorityContactsCardState'
import { AuthorityContactDeleteDialog } from './AuthorityContactDeleteDialog'
import { AuthorityContactModal } from './AuthorityContactModal'
import { AuthorityContactsListCard } from './AuthorityContactsListCard'
import { AUTHORITY_CONTACT_TEXT } from '../constants'

interface AuthorityContactsCardProps {
  clientId: number
}

export const AuthorityContactsCard: React.FC<AuthorityContactsCardProps> = ({ clientId }) => {
  const { contacts, total, page, setPage, totalPages, isLoading, error, retry, deleteContact, deletingId } =
    useAuthorityContacts(clientId)
  const { editing, isModalOpen, confirmDeleteId, openCreate, openEdit, closeModal, requestDelete, clearDeleteRequest } =
    useAuthorityContactsCardState()

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

      <AuthorityContactDeleteDialog
        confirmDeleteId={confirmDeleteId}
        deletingId={deletingId}
        onConfirm={deleteContact}
        onCancel={clearDeleteRequest}
      />
    </div>
  )
}
