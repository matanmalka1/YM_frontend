import { Clock, Pencil, UserCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CLIENT_ROUTES } from '../../api/endpoints'
import { formatClientOfficeId } from '@/utils/utils'
import { Button } from '@/components/ui/primitives/Button'

interface ClientRowActionsProps {
  clientId: number
  officeClientNumber: number | null
  onEditClient?: () => void
}

export const ClientRowActions: React.FC<ClientRowActionsProps> = ({ clientId, officeClientNumber, onEditClient }) => {
  const navigate = useNavigate()
  const clientOfficeId = formatClientOfficeId(officeClientNumber)

  return (
    <div aria-label={`פעולות ללקוח ${clientOfficeId}`} className="flex items-center justify-center gap-0.5">
      <Button
        variant="ghost"
        size="sm"
        tooltip="פתח פרופיל"
        aria-label="פתח פרופיל"
        className="p-1.5 text-gray-400 hover:text-gray-700"
        onClick={(e) => { e.stopPropagation(); navigate(CLIENT_ROUTES.detail(clientId)) }}
      >
        <UserCircle className="h-4 w-4" />
      </Button>
      {onEditClient && (
        <Button
          variant="ghost"
          size="sm"
          tooltip="עריכת לקוח"
          aria-label="עריכת לקוח"
          className="p-1.5 text-gray-400 hover:text-gray-700"
          onClick={(e) => { e.stopPropagation(); onEditClient() }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        tooltip="ציר זמן"
        aria-label="ציר זמן"
        className="p-1.5 text-gray-400 hover:text-gray-700"
        onClick={(e) => { e.stopPropagation(); navigate(CLIENT_ROUTES.timeline(clientId)) }}
      >
        <Clock className="h-4 w-4" />
      </Button>
    </div>
  )
}

ClientRowActions.displayName = 'ClientRowActions'
