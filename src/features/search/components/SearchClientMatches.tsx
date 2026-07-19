import { Building2 } from 'lucide-react'
import { ActionSurfaceButton } from '@/components/ui/primitives/ActionSurface'
import { Card } from '@/components/ui/primitives/Card'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import { CLIENT_STATUS_BADGE_VARIANTS, getClientStatusLabel } from '@/features/clients'
import { formatClientOfficeId } from '@/utils/utils'
import type { SearchClientMatch } from '../api/contracts'
import { SEARCH_MESSAGES } from '../messages'

interface SearchClientMatchesProps {
  clients: SearchClientMatch[]
  total: number
  onSelect: (clientRecordId: number) => void
}

/**
 * Phase one of the page: which client did the term mean. Shown only while the answer is
 * ambiguous — a single match is auto-selected by the backend and goes straight to the feed.
 */
export const SearchClientMatches: React.FC<SearchClientMatchesProps> = ({ clients, total, onSelect }) => (
  <Card
    title={SEARCH_MESSAGES.clients.title}
    subtitle={SEARCH_MESSAGES.clients.subtitle(total)}
    icon={<Building2 className="h-4 w-4" />}
    size="compact"
    disablePadding
  >
    {clients.map((client) => (
      <ActionSurfaceButton
        key={client.id}
        variant="plainRow"
        onClick={() => onSelect(client.id)}
        className="border-b border-gray-100 last:border-b-0"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-gray-900">{client.name}</span>
            <StatusBadge
              status={client.status}
              getLabel={getClientStatusLabel}
              variantMap={CLIENT_STATUS_BADGE_VARIANTS}
              size="2xs"
            />
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {SEARCH_MESSAGES.clients.officeNumber} {formatClientOfficeId(client.office_client_number)}
            {client.id_number ? ` · ${SEARCH_MESSAGES.clients.idNumber} ${client.id_number}` : ''}
            {client.matched_binder_numbers.length > 0
              ? ` · ${SEARCH_MESSAGES.clients.matchedBinders(client.matched_binder_numbers)}`
              : ''}
          </p>
        </div>
      </ActionSurfaceButton>
    ))}
  </Card>
)

SearchClientMatches.displayName = 'SearchClientMatches'
