import { Edit2, Mail, MapPin, Phone, Trash2 } from 'lucide-react'
import { Button } from '../../../../components/ui/primitives/Button'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { formatPhoneNumber } from '@/utils/utils'
import { getContactTypeLabel, type AuthorityContactResponse } from '../../api'

interface AuthorityContactRowProps {
  contact: AuthorityContactResponse
  isDeleting: boolean
  onEdit: (contact: AuthorityContactResponse) => void
  onDelete: (id: number) => void
}

export const AuthorityContactRow: React.FC<AuthorityContactRowProps> = ({ contact, isDeleting, onEdit, onDelete }) => (
  <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
    <div className="flex-1 space-y-1.5">
      <div className="flex items-center gap-2">
        <Badge variant="info">{getContactTypeLabel(contact.contact_type)}</Badge>
        <span className="font-medium text-gray-900">{contact.name}</span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
        {contact.office && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {contact.office}
          </span>
        )}
        {contact.phone && (
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {formatPhoneNumber(contact.phone)}
          </span>
        )}
        {contact.email && (
          <span className="flex items-center gap-1">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            {contact.email}
          </span>
        )}
      </div>

      {contact.notes && <p className="mt-1.5 border-t border-gray-100 pt-1.5 text-sm text-gray-500">{contact.notes}</p>}
    </div>

    <div className="flex shrink-0 gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        icon={<Edit2 className="h-4 w-4" />}
        tooltip="עריכת איש קשר"
        aria-label="עריכת איש קשר"
        onClick={() => onEdit(contact)}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        icon={<Trash2 className="h-4 w-4" />}
        isLoading={isDeleting}
        tooltip="מחיקת איש קשר"
        aria-label="מחיקת איש קשר"
        onClick={() => onDelete(contact.id)}
        className="text-negative-600 hover:bg-negative-50"
      />
    </div>
  </div>
)
