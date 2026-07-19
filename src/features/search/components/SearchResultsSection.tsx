import { FileSearch, Search as SearchIcon } from 'lucide-react'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { Alert } from '@/components/ui/overlays/Alert'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { DataTable, PaginationCard, type Column } from '@/components/ui/table'
import type { DocumentSearchResult, SearchResult } from '../api'
import type { OperationalSearchResults } from '../api/contracts'
import type { SearchFilters } from '../types'
import { SEARCH_MESSAGES } from '../messages'
import { DocumentResultsSection } from './DocumentResultsSection'
import { OperationalResultsSection } from './OperationalResultsSection'

interface SearchResultsSectionProps {
  status: {
    isLoading: boolean
    error: string | null
  }
  prompt: {
    visible: boolean
  }
  emptyState: {
    visible: boolean
    onReset: () => void
  }
  operational: {
    visible: boolean
    data: OperationalSearchResults
  }
  table: {
    visible: boolean
    data: SearchResult[]
    columns: Column<SearchResult>[]
    page: number
    totalPages: number
    total: number
    onPageChange: (page: number) => void
  }
  documents: {
    visible: boolean
    data: DocumentSearchResult[]
    filenameFilter: string
    onFilterChange: (name: keyof SearchFilters, value: string) => void
  }
}

export const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  status,
  prompt,
  emptyState,
  operational,
  table,
  documents,
}) => (
  <>
    {status.error && <Alert variant="error" message={status.error} />}

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

    {operational.visible && <OperationalResultsSection operational={operational.data} />}

    {table.visible && (
      <>
        <DataTable<SearchResult>
          data={table.data}
          columns={table.columns}
          getRowKey={(result) => `${result.result_type}-${result.client_record_id}-${result.binder_id ?? 'none'}`}
          isLoading={status.isLoading}
          emptyMessage={GLOBAL_UI_MESSAGES.common.noResults}
        />

        {!status.isLoading && table.totalPages > 1 && (
          <PaginationCard
            page={table.page}
            totalPages={table.totalPages}
            total={table.total}
            onPageChange={table.onPageChange}
          />
        )}
      </>
    )}

    {documents.visible && (
      <DocumentResultsSection
        documents={documents.data}
        filenameFilter={documents.filenameFilter}
        onFilenameChange={documents.onFilterChange}
      />
    )}
  </>
)

SearchResultsSection.displayName = 'SearchResultsSection'
