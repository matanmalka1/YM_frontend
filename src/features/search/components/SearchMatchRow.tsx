import { Archive, Bell, FileSpreadsheet, FileText, ListTodo, Receipt, TrendingUp, WalletCards } from 'lucide-react'
import { ActionSurfaceLink } from '@/components/ui/primitives/ActionSurface'
import { Badge } from '@/components/ui/primitives/Badge'
import { formatClientOfficeId, formatDate, formatShekelAmount } from '@/utils/utils'
import type { SearchMatch, SearchMatchType } from '../api/contracts'
import { getSearchMatchBadgeLabel } from '../constants'
import { SEARCH_MESSAGES } from '../messages'

/** One icon per type: in the mixed preview it is the only thing that says what a row is. */
const SEARCH_MATCH_ICONS: Record<SearchMatchType, React.ReactNode> = {
  binder: <Archive className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  vat_work_item: <Receipt className="h-4 w-4" />,
  annual_report: <FileSpreadsheet className="h-4 w-4" />,
  advance_payment: <TrendingUp className="h-4 w-4" />,
  charge: <WalletCards className="h-4 w-4" />,
  task: <ListTodo className="h-4 w-4" />,
  notification: <Bell className="h-4 w-4" />,
}

/**
 * The one row shape every match type uses. Every row names its owning client — matches from
 * every client appear in one list, so a row without its client would be meaningless.
 * Clicking follows the record's own deep link.
 */
export const SearchMatchRow: React.FC<{ match: SearchMatch }> = ({ match }) => {
  const badgeLabel = getSearchMatchBadgeLabel(match.result_type, match.status, match.detail)
  const typeLabel = SEARCH_MESSAGES.matches.typeLabels[match.result_type]
  // Documents put their type in `detail`, and the badge already shows it.
  const subtitle = match.result_type === 'document' ? null : match.detail || null

  return (
    <ActionSurfaceLink variant="plainRow" to={match.href} className="border-b border-gray-100 last:border-b-0">
      <span className="shrink-0 text-gray-400" title={typeLabel} aria-label={typeLabel}>
        {SEARCH_MATCH_ICONS[match.result_type]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-gray-900">{match.title}</span>
          {badgeLabel && (
            <Badge variant="neutral" size="2xs">
              {badgeLabel}
            </Badge>
          )}
        </div>
        {subtitle && <p className="mt-0.5 truncate text-xs text-gray-500">{subtitle}</p>}
        <p className="mt-0.5 truncate text-xs text-gray-500">
          {match.client_name} · {SEARCH_MESSAGES.clients.officeNumber} {formatClientOfficeId(match.client_office_number)}
        </p>
      </div>
      {match.amount !== null && (
        <span className="shrink-0 text-sm font-medium tabular-nums">{formatShekelAmount(match.amount)}</span>
      )}
      {match.occurred_on && (
        <span className="w-20 shrink-0 text-left text-xs text-gray-400 tabular-nums">{formatDate(match.occurred_on)}</span>
      )}
    </ActionSurfaceLink>
  )
}

SearchMatchRow.displayName = 'SearchMatchRow'
