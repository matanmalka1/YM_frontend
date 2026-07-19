import { Archive, Bell, FileSpreadsheet, FileText, ListTodo, Receipt, TrendingUp, WalletCards } from 'lucide-react'
import { ActionSurfaceLink } from '@/components/ui/primitives/ActionSurface'
import { Badge } from '@/components/ui/primitives/Badge'
import { formatDate, formatShekelAmount } from '@/utils/utils'
import type { SearchItem, SearchItemType } from '../api/contracts'
import { getSearchItemBadgeLabel } from '../constants'
import { SEARCH_MESSAGES } from '../messages'

/** One icon per type: in the mixed feed it is the only thing that says what a row is. */
const SEARCH_ITEM_ICONS: Record<SearchItemType, React.ReactNode> = {
  binder: <Archive className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  vat_work_item: <Receipt className="h-4 w-4" />,
  annual_report: <FileSpreadsheet className="h-4 w-4" />,
  advance_payment: <TrendingUp className="h-4 w-4" />,
  charge: <WalletCards className="h-4 w-4" />,
  task: <ListTodo className="h-4 w-4" />,
  notification: <Bell className="h-4 w-4" />,
}

/** The one row shape every result type uses, whatever domain it came from. */
export const SearchItemRow: React.FC<{ item: SearchItem }> = ({ item }) => {
  const badgeLabel = getSearchItemBadgeLabel(item.result_type, item.status, item.detail)
  const typeLabel = SEARCH_MESSAGES.feed.typeLabels[item.result_type]
  // Documents put their type in `detail`, and the badge already shows it.
  const subtitle = item.result_type === 'document' ? null : item.detail || null

  return (
    <ActionSurfaceLink variant="plainRow" to={item.href} className="border-b border-gray-100 last:border-b-0">
      <span className="shrink-0 text-gray-400" title={typeLabel} aria-label={typeLabel}>
        {SEARCH_ITEM_ICONS[item.result_type]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-gray-900">{item.title}</span>
          {badgeLabel && (
            <Badge variant="neutral" size="2xs">
              {badgeLabel}
            </Badge>
          )}
        </div>
        {subtitle && <p className="mt-0.5 truncate text-xs text-gray-500">{subtitle}</p>}
      </div>
      {item.amount !== null && (
        <span className="shrink-0 text-sm font-medium tabular-nums">{formatShekelAmount(item.amount)}</span>
      )}
      {item.occurred_on && (
        <span className="w-20 shrink-0 text-left text-xs text-gray-400 tabular-nums">
          {formatDate(item.occurred_on)}
        </span>
      )}
    </ActionSurfaceLink>
  )
}

SearchItemRow.displayName = 'SearchItemRow'
