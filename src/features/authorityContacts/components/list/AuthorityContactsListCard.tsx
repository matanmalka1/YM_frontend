import { Plus } from 'lucide-react'
import { Card } from '../../../../components/ui/primitives/Card'
import { Button } from '../../../../components/ui/primitives/Button'
import { Alert } from '../../../../components/ui/overlays/Alert'
import type { AuthorityContactResponse } from '../../api'
import { AUTHORITY_CONTACT_TEXT } from '../../constants'
import { getAuthorityContactsSubtitle } from '../../helpers'
import { AuthorityContactsListContent } from './AuthorityContactsListContent'

interface AuthorityContactsListCardProps {
  contacts: AuthorityContactResponse[]
  total: number
  isLoading: boolean
  error: string | null
  deletingId: number | null
  onRetry: () => void
  onCreate: () => void
  onEdit: (contact: AuthorityContactResponse) => void
  onDelete: (id: number) => void
}

export const AuthorityContactsListCard: React.FC<AuthorityContactsListCardProps> = ({
  contacts,
  total,
  isLoading,
  error,
  deletingId,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
}) => (
  <Card
    title={AUTHORITY_CONTACT_TEXT.cardTitle}
    subtitle={getAuthorityContactsSubtitle(total)}
    actions={
      <Button type="button" variant="primary" size="sm" className="gap-2" onClick={onCreate}>
        <Plus className="h-4 w-4" />
        {AUTHORITY_CONTACT_TEXT.addButton}
      </Button>
    }
  >
    {error && <Alert variant="error" message={error} onRetry={onRetry} />}
    {!error && (
      <AuthorityContactsListContent
        contacts={contacts}
        deletingId={deletingId}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )}
  </Card>
)
