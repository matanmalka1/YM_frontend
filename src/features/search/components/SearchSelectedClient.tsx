import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import { CLIENT_STATUS_BADGE_VARIANTS, getClientStatusLabel } from '@/features/clients'
import { InlineLink } from '@/components/ui/primitives/InlineLink'
import { formatClientOfficeId } from '@/utils/utils'
import type { SearchClientMatch } from '../api/contracts'
import { SEARCH_MESSAGES } from '../messages'

interface SearchSelectedClientProps {
  client: SearchClientMatch
  /** Absent when the term resolved to this client alone — there is nothing to go back to. */
  onChange: (() => void) | null
}

/**
 * Names the subject of the feed. Without it the page shows a list of items with no
 * statement of whose they are, and no way back to the other matches.
 */
export const SearchSelectedClient: React.FC<SearchSelectedClientProps> = ({ client, onChange }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
    <InlineLink href={client.href} className="text-base font-semibold text-gray-900">
      {client.name}
    </InlineLink>
    <StatusBadge
      status={client.status}
      getLabel={getClientStatusLabel}
      variantMap={CLIENT_STATUS_BADGE_VARIANTS}
      size="2xs"
    />
    <span className="text-xs text-gray-500">
      {SEARCH_MESSAGES.clients.officeNumber} {formatClientOfficeId(client.office_client_number)}
      {client.id_number ? ` · ${SEARCH_MESSAGES.clients.idNumber} ${client.id_number}` : ''}
    </span>
    {onChange && (
      <Button
        type="button"
        variant="ghost"
        size="xs"
        icon={<RotateCcw className="h-3.5 w-3.5" />}
        onClick={onChange}
        className="mr-auto"
      >
        {SEARCH_MESSAGES.clients.change}
      </Button>
    )}
  </div>
)

SearchSelectedClient.displayName = 'SearchSelectedClient'
