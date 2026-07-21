import { Inbox } from 'lucide-react'
import { Chip } from '@/components/ui/primitives/Chip'
import { PaginationCard } from '@/components/ui/table'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { TableSkeleton } from '@/components/ui/table'
import type { SearchItem, SearchItemType } from '../api/contracts'
import type { SearchPagination } from '../types'
import { SEARCH_MESSAGES } from '../messages'
import { SearchItemRow } from './SearchItemRow'

export interface SearchFeedChip {
  type: SearchItemType
  count: number
}

interface SearchItemFeedProps {
  chips: SearchFeedChip[]
  activeType: SearchItemType | null
  onTypeChange: (type: SearchItemType | null) => void
  items: SearchItem[]
  isLoading: boolean
  pagination: SearchPagination | null
}

/**
 * Every item of the selected client, in one uniform list. Picking a type chip swaps the
 * mixed preview for that type's full, paginated list.
 */
export const SearchItemFeed: React.FC<SearchItemFeedProps> = ({ chips, activeType, onTypeChange, items, isLoading, pagination }) => {
  if (chips.length === 0) {
    return <StateCard icon={Inbox} title={SEARCH_MESSAGES.feed.emptyTitle} message={SEARCH_MESSAGES.feed.emptyMessage} />
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Chip selected={activeType === null} onClick={() => onTypeChange(null)}>
          {SEARCH_MESSAGES.feed.allTypes}
        </Chip>
        {chips.map(({ type, count }) => (
          <Chip key={type} selected={activeType === type} count={count} onClick={() => onTypeChange(type)}>
            {SEARCH_MESSAGES.feed.typeLabels[type]}
          </Chip>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
          {items.map((item) => (
            <SearchItemRow key={`${item.result_type}-${item.id}`} item={item} />
          ))}
        </div>
      )}

      {pagination && !isLoading && pagination.totalPages > 1 && (
        <PaginationCard page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={pagination.onPageChange} />
      )}
    </section>
  )
}

SearchItemFeed.displayName = 'SearchItemFeed'
