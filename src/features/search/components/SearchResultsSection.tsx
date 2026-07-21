import { FileSearch, Search as SearchIcon } from 'lucide-react'
import { Alert } from '@/components/ui/overlays/Alert'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { PageLoading } from '@/components/ui/layout/PageLoading'
import { cn } from '@/utils/utils'
import { SEARCH_MESSAGES } from '../messages'
import { SearchClientMatches } from './SearchClientMatches'
import { SearchMatchesSection } from './SearchMatchesSection'

interface SearchResultsSectionProps {
  status: {
    isLoading: boolean
    isFetching: boolean
    error: string | null
  }
  prompt: { visible: boolean }
  /** One no-match state for the whole page: zero clients and zero record matches. */
  emptyState: { visible: boolean; onReset: () => void }
  clientMatches: React.ComponentProps<typeof SearchClientMatches> & { visible: boolean }
  matches: React.ComponentProps<typeof SearchMatchesSection> & { visible: boolean }
}

/**
 * The page's two labelled sections, side by side: the clients the term resolved to, and the
 * records it matched. Both can be non-empty at once — that is the point of the page.
 */
export const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  status,
  prompt,
  emptyState,
  clientMatches,
  matches,
}) => (
  <>
    {status.error && <Alert variant="error" message={status.error} />}
    {status.isLoading && <PageLoading />}

    {prompt.visible && (
      <StateCard
        icon={SearchIcon}
        title={SEARCH_MESSAGES.page.promptTitle}
        message={SEARCH_MESSAGES.page.promptMessage}
        variant="illustration"
      />
    )}

    {emptyState.visible && (
      <StateCard
        icon={FileSearch}
        title={SEARCH_MESSAGES.page.emptyTitle}
        message={SEARCH_MESSAGES.page.emptyMessage}
        action={{ label: SEARCH_MESSAGES.page.resetSearch, onClick: emptyState.onReset }}
      />
    )}

    {/* Rows already on screen are stale while a newer query runs — dim them rather than
          swapping in a skeleton, so the layout does not jump on every keystroke. */}
    <div
      aria-busy={status.isFetching}
      className={cn('space-y-4 transition-opacity', status.isFetching && 'pointer-events-none opacity-50')}
    >
      {clientMatches.visible && <SearchClientMatches {...clientMatches} />}
      {matches.visible && <SearchMatchesSection {...matches} />}
    </div>
  </>
)

SearchResultsSection.displayName = 'SearchResultsSection'
