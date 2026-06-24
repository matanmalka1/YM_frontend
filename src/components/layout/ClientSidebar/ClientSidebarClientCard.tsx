import { NavLink } from 'react-router-dom'
import { Building2, Mail, Phone, ReceiptText } from 'lucide-react'
import { CLIENT_ROUTES } from '@/features/clients'
import { Badge } from '@/components/ui/primitives/Badge'
import { cn, formatClientOfficeId, formatPhoneNumber } from '@/utils/utils'
import type { ClientSidebarItem } from './useClientSidebarClients'
import { getEntityLabel, getVatLabel } from './ClientSidebar.labels'

interface ClientSidebarClientCardProps {
  client: ClientSidebarItem
  onNavigate: () => void
}

export const ClientSidebarClientCard: React.FC<ClientSidebarClientCardProps> = ({ client, onNavigate }) => (
  <NavLink
    to={CLIENT_ROUTES.detail(client.id)}
    onClick={onNavigate}
    className={({ isActive }) =>
      cn(
        'focus-ring group block rounded-2xl border p-3 text-right transition',
        isActive
          ? 'border-primary-200 bg-primary-50/80 shadow-sm'
          : 'border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/70 hover:shadow-sm',
      )
    }
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <span className="block truncate text-sm font-semibold text-gray-950" title={client.displayName}>
          {client.displayName}
        </span>
      </div>
      <Badge variant="neutral" size="2xs" className="shrink-0 font-semibold tabular-nums text-gray-600">
        {client.officeClientNumber == null ? 'ללא מספר משרד' : `מס׳ ${formatClientOfficeId(client.officeClientNumber)}`}
      </Badge>
    </div>

    <div className="mt-3 flex flex-wrap gap-1.5">
      <Badge variant="neutral" size="2xs" icon={<Building2 className="h-3 w-3" />} className="text-gray-600">
        {getEntityLabel(client)}
      </Badge>
      <Badge variant="neutral" size="2xs" icon={<ReceiptText className="h-3 w-3" />} className="text-gray-600">
        מע״מ {getVatLabel(client)}
      </Badge>
    </div>

    <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-2.5 text-xs">
      <span className="flex min-w-0 items-center gap-2 text-gray-500">
        <Phone className="h-3.5 w-3.5 shrink-0" />
        {client.phone ? (
          <bdi dir="ltr" className="truncate text-gray-700">
            {formatPhoneNumber(client.phone)}
          </bdi>
        ) : (
          <span className="text-gray-400">לא הוזן טלפון</span>
        )}
      </span>
      <span className="flex min-w-0 items-center gap-2 text-gray-500">
        <Mail className="h-3.5 w-3.5 shrink-0" />
        {client.email ? (
          <bdi dir="ltr" className="truncate text-left text-gray-700" title={client.email}>
            {client.email}
          </bdi>
        ) : (
          <span className="text-gray-400">לא הוזן דוא״ל</span>
        )}
      </span>
    </div>
  </NavLink>
)
