import { Clock, Pencil, UserCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CLIENT_ROUTES } from '../../api/endpoints'
import { formatClientOfficeId } from '@/utils/utils'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table'
import { CLIENTS_MESSAGES } from '../../messages'

interface ClientRowActionsProps {
  clientId: number
  officeClientNumber: number | null
  onEditClient?: () => void
}

export const ClientRowActions: React.FC<ClientRowActionsProps> = ({ clientId, officeClientNumber, onEditClient }) => {
  const navigate = useNavigate()
  const clientOfficeId = formatClientOfficeId(officeClientNumber)

  return (
    <RowActionsMenu ariaLabel={CLIENTS_MESSAGES.list.rowActionsAriaLabel(clientOfficeId)}>
      <RowActionItem
        label={CLIENTS_MESSAGES.rowActions.openProfile}
        onClick={() => navigate(CLIENT_ROUTES.detail(clientId))}
        icon={<UserCircle className="h-4 w-4" />}
      />
      {onEditClient && (
        <RowActionItem
          label={CLIENTS_MESSAGES.rowActions.editClient}
          onClick={onEditClient}
          icon={<Pencil className="h-4 w-4" />}
        />
      )}
      <RowActionItem
        label={CLIENTS_MESSAGES.rowActions.timeline}
        onClick={() => navigate(CLIENT_ROUTES.timeline(clientId))}
        icon={<Clock className="h-4 w-4" />}
      />
    </RowActionsMenu>
  )
}

ClientRowActions.displayName = 'ClientRowActions'
