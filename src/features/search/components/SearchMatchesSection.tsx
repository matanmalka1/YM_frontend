import { Layers } from 'lucide-react'
import { Card } from '@/components/ui/primitives/Card'
import { Chip } from '@/components/ui/primitives/Chip'
import { PaginationCard, TableSkeleton } from '@/components/ui/table'
import type { SearchMatch, SearchMatchGroups, SearchMatchType } from '../api/contracts'
import type { SearchPagination } from '../types'
import type { SearchMatchChip } from '../utils/searchMatches'
import { SEARCH_GROUP_ORDER, SEARCH_GROUP_TYPES } from '../constants'
import { SEARCH_MESSAGES } from '../messages'
import { SearchMatchRow } from './SearchMatchRow'

interface SearchMatchesSectionProps {
  /** One chip per type with matches, carrying the exact totals. */
  chips: SearchMatchChip[]
  activeType: SearchMatchType | null
  onTypeChange: (type: SearchMatchType | null) => void
  /** The grouped previews — up to five rows per type. */
  groups: SearchMatchGroups
  /** The active chip's full paginated list, or null while no chip is active. */
  expanded: {
    items: SearchMatch[]
    isLoading: boolean
    pagination: SearchPagination | null
  } | null
}

/**
 * The records the term matched, across every client. A chip row filters by type: with no chip
 * active every non-empty group shows its preview under a type heading; with a chip active that
 * type's full list is shown, paginated. Row click follows the record's own deep link.
 */
export const SearchMatchesSection: React.FC<SearchMatchesSectionProps> = ({
  chips,
  activeType,
  onTypeChange,
  groups,
  expanded,
}) => {
  const total = chips.reduce((sum, chip) => sum + chip.count, 0)

  return (
    <>
      <Card
        title={SEARCH_MESSAGES.matches.title}
        subtitle={SEARCH_MESSAGES.matches.subtitle(total)}
        icon={<Layers className="h-4 w-4" />}
        size="compact"
        disablePadding
      >
        <div className="flex flex-wrap gap-2 px-5 py-3">
          <Chip selected={activeType === null} onClick={() => onTypeChange(null)}>
            {SEARCH_MESSAGES.matches.allTypes}
          </Chip>
          {chips.map(({ type, count }) => (
            <Chip key={type} selected={activeType === type} count={count} onClick={() => onTypeChange(type)}>
              {SEARCH_MESSAGES.matches.typeLabels[type]}
            </Chip>
          ))}
        </div>

        {expanded ? (
          expanded.isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="border-t border-gray-100">
              {expanded.items.map((match) => (
                <SearchMatchRow key={`${match.result_type}-${match.id}`} match={match} />
              ))}
            </div>
          )
        ) : (
          SEARCH_GROUP_ORDER.filter((key) => groups[key].items.length > 0).map((key) => (
            <div key={key}>
              <h3 className="border-y border-gray-100 bg-gray-50/60 px-5 py-1.5 text-xs font-medium text-gray-500">
                {SEARCH_MESSAGES.matches.typeLabels[SEARCH_GROUP_TYPES[key]]}
              </h3>
              {groups[key].items.map((match) => (
                <SearchMatchRow key={`${match.result_type}-${match.id}`} match={match} />
              ))}
            </div>
          ))
        )}
      </Card>
      {expanded?.pagination && !expanded.isLoading && expanded.pagination.totalPages > 1 && (
        <PaginationCard
          page={expanded.pagination.page}
          totalPages={expanded.pagination.totalPages}
          total={expanded.pagination.total}
          onPageChange={expanded.pagination.onPageChange}
        />
      )}
    </>
  )
}

SearchMatchesSection.displayName = 'SearchMatchesSection'
