import { GLOBAL_UI_MESSAGES } from '@/messages'
import { useRef, useState } from 'react'
import { useSearchDebounce } from '@/hooks/useSearchDebounce'
import { getTotalPages } from '@/utils/paginationUtils'
import { Search as SearchIcon, FileSearch } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { Input } from '@/components/ui/inputs/Input'
import { DataTable, PaginationCard } from '@/components/ui/table'
import { Alert } from '@/components/ui/overlays/Alert'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { GLOBAL_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import { DocumentResultsSection } from '../components/DocumentResultsSection'
import { searchColumns } from '../components/SearchColumns'
import { SearchFiltersBar } from '../components/SearchFiltersBar'
import { useSearchPage } from '../hooks/useSearchPage'
import { SEARCH_ADVANCED_FILTER_KEYS } from '../types'
import type { SearchResult } from '../api'
import { PAGE_SIZE_SM as PAGE_SIZE } from '@/constants/pagination.constants'
import { SEARCH_MESSAGES } from '../messages'
import { ClientStatusCard } from '@/features/clients'
import { OperationalResultsSection } from '../components/OperationalResultsSection'

export const Search: React.FC = () => {
  const {
    error,
    filters,
    hasAnyFilter,
    handleFilterChange,
    handleReset,
    hydratedClient,
    loading,
    operational,
    results,
    documents,
    total,
  } = useSearchPage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [queryDraft, setQueryDraft] = useSearchDebounce(filters.search, (v) => handleFilterChange('search', v))

  const hasAdvancedFilter = SEARCH_ADVANCED_FILTER_KEYS.some((key) => Boolean(filters[key]))
  const [filtersOpen, setFiltersOpen] = useState(hasAdvancedFilter)

  const totalPages = getTotalPages(total, PAGE_SIZE)
  const operationalTotal = Object.values(operational).reduce((sum, group) => sum + group.total, 0)

  const handleResetAll = () => {
    handleReset()
    setFiltersOpen(false)
    inputRef.current?.focus()
  }

  return (
    <PageContent>
      <PageHeader title={GLOBAL_UI_MESSAGES.common.search} description={SEARCH_MESSAGES.page.description} />

      <ToolbarContainer>
        <div className="flex flex-wrap items-start gap-2">
          <div className="min-w-[200px] flex-1">
            <Input
              ref={inputRef}
              type="text"
              value={queryDraft}
              onChange={(e) => setQueryDraft(e.target.value)}
              placeholder={GLOBAL_SEARCH_PLACEHOLDER}
              startIcon={<SearchIcon className="h-4 w-4" />}
              autoFocus
            />
          </div>
          <SearchFiltersBar
            filters={filters}
            hydratedClient={hydratedClient}
            onFilterChange={handleFilterChange}
            onReset={handleResetAll}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen((o) => !o)}
          />
        </div>
      </ToolbarContainer>

      {hydratedClient && <ClientStatusCard clientId={hydratedClient.id} />}

      {error && <Alert variant="error" message={error} />}

      {!loading && !error && !hasAnyFilter && (
        <StateCard
          icon={SearchIcon}
          title={SEARCH_MESSAGES.page.promptTitle}
          message={SEARCH_MESSAGES.page.promptMessage}
          variant="illustration"
        />
      )}

      {!loading &&
        !error &&
        hasAnyFilter &&
        results.length === 0 &&
        documents.length === 0 &&
        operationalTotal === 0 && (
          <StateCard
            icon={FileSearch}
            title={SEARCH_MESSAGES.page.emptyTitle}
            message={SEARCH_MESSAGES.page.emptyMessage}
            action={{ label: SEARCH_MESSAGES.page.resetSearch, onClick: handleResetAll }}
          />
        )}

      {!loading && <OperationalResultsSection operational={operational} />}

      {(loading || results.length > 0) && (
        <>
          <DataTable<SearchResult>
            data={results}
            columns={searchColumns}
            getRowKey={(r) => `${r.result_type}-${r.client_record_id}-${r.binder_id ?? 'none'}`}
            isLoading={loading}
            emptyMessage={GLOBAL_UI_MESSAGES.common.noResults}
          />

          {!loading && totalPages > 1 && (
            <PaginationCard
              page={filters.page}
              totalPages={totalPages}
              total={total}
              onPageChange={(page) => handleFilterChange('page', String(page))}
            />
          )}
        </>
      )}

      {!loading && (
        <DocumentResultsSection
          documents={documents}
          filenameFilter={filters.filename ?? ''}
          onFilenameChange={handleFilterChange}
        />
      )}
    </PageContent>
  )
}
