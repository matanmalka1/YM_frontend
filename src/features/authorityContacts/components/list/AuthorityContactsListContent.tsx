import { Users } from 'lucide-react'
import { StateCard } from '../../../../components/ui/feedback/StateCard'
import type { AuthorityContactResponse } from '../../api'
import { AUTHORITY_CONTACT_TEXT } from '../../constants'
import { AuthorityContactRow } from './AuthorityContactRow'

interface AuthorityContactsListContentProps {
  contacts: AuthorityContactResponse[]
  deletingId: number | null
  isLoading: boolean
  onEdit: (contact: AuthorityContactResponse) => void
  onDelete: (id: number) => void
}

export const AuthorityContactsListContent: React.FC<AuthorityContactsListContentProps> = ({
  contacts,
  deletingId,
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return <p className="py-4 text-center text-sm text-gray-500">{AUTHORITY_CONTACT_TEXT.loading}</p>
  }

  if (contacts.length === 0) {
    return <StateCard icon={Users} message={AUTHORITY_CONTACT_TEXT.empty} size="compact" variant="minimal" />
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <AuthorityContactRow
          key={contact.id}
          contact={contact}
          isDeleting={deletingId === contact.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
