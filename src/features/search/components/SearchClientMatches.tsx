import { Building2 } from 'lucide-react'
import { ActionSurfaceLink } from '@/components/ui/primitives/ActionSurface'
import { Card } from '@/components/ui/primitives/Card'
import { PaginationCard } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import { CLIENT_STATUS_BADGE_VARIANTS, getClientStatusLabel } from '@/features/clients'
import { formatClientOfficeId } from '@/utils/utils'
import type { SearchClientMatch } from '../api/contracts'
import type { SearchPagination } from '../types'
import { SEARCH_MESSAGES } from '../messages'

interface SearchClientMatchesProps {
  clients: SearchClientMatch[]
  total: number
  /** Null while a match type is expanded — the clients section then shows its first page only. */
  pagination: SearchPagination | null
}

/**
 * The clients the term resolved to. A row click navigates to the client's page, whose tabs
 * are the dossier — never automatically, whatever the match count.
 */
export const SearchClientMatches: React.FC<SearchClientMatchesProps> = ({ clients, total, pagination }) => (
  <>
    <Card
      title={SEARCH_MESSAGES.clients.title}
      subtitle={SEARCH_MESSAGES.clients.subtitle(total)}
      icon={<Building2 className="h-4 w-4" />}
      size="compact"
      disablePadding
    >
      {clients.map((client) => (
        <ActionSurfaceLink
          key={client.id}
          variant="plainRow"
          to={client.href}
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
        </ActionSurfaceLink>
      ))}
    </Card>
    {pagination && pagination.totalPages > 1 && (
      <PaginationCard
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={pagination.onPageChange}
      />
    )}
  </>
)

SearchClientMatches.displayName = 'SearchClientMatches'
