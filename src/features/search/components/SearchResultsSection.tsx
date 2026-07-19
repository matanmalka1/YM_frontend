import { FileSearch, Search as SearchIcon } from 'lucide-react'
import { Alert } from '@/components/ui/overlays/Alert'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { PageLoading } from '@/components/ui/layout/PageLoading'
import { cn } from '@/utils/utils'
import type { SearchClientMatch } from '../api/contracts'
import { SEARCH_MESSAGES } from '../messages'
import { SearchClientMatches } from './SearchClientMatches'
import { SearchItemFeed } from './SearchItemFeed'
import { SearchSelectedClient } from './SearchSelectedClient'

interface SearchResultsSectionProps {
  status: {
    isLoading: boolean
    isFetching: boolean
    error: string | null
  }
  prompt: { visible: boolean }
  emptyState: { visible: boolean; onReset: () => void }
  clientMatches: {
    visible: boolean
    data: SearchClientMatch[]
    total: number
    onSelect: (clientRecordId: number) => void
  }
  selectedClient: {
    visible: boolean
    client: SearchClientMatch | null
    onChange: (() => void) | null
  }
  feed: React.ComponentProps<typeof SearchItemFeed> & { visible: boolean }
}

export const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  status,
  prompt,
  emptyState,
  clientMatches,
  selectedClient,
  feed,
}) => {
  const { visible: feedVisible, ...feedProps } = feed

  return (
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
        {clientMatches.visible && (
          <SearchClientMatches
            clients={clientMatches.data}
            total={clientMatches.total}
            onSelect={clientMatches.onSelect}
          />
        )}

        {selectedClient.visible && selectedClient.client && (
          <SearchSelectedClient client={selectedClient.client} onChange={selectedClient.onChange} />
        )}

        {feedVisible && <SearchItemFeed {...feedProps} />}
      </div>
    </>
  )
}

SearchResultsSection.displayName = 'SearchResultsSection'
