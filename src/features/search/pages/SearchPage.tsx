import { useRef, useState } from 'react'
import { useSearchDebounce } from '@/hooks/useSearchDebounce'
import { formatCount } from '@/utils/utils'
import { Search as SearchIcon, FileSearch } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { Input } from '@/components/ui/inputs/Input'
import { DataTable } from '@/components/ui/table/DataTable'
import { Alert } from '@/components/ui/overlays/Alert'
import { PaginationCard } from '@/components/ui/table/PaginationCard'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { GLOBAL_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import { DocumentResultsSection } from '../components/DocumentResultsSection'
import { searchColumns } from '../components/SearchColumns'
import { SearchFiltersBar } from '../components/SearchFiltersBar'
import { useSearchPage } from '../hooks/useSearchPage'
import { SEARCH_ADVANCED_FILTER_KEYS } from '../types'
import type { SearchResult } from '../api'

const PAGE_SIZE = 20

export const Search: React.FC = () => {
  const { error, filters, hasAnyFilter, handleFilterChange, handleReset, loading, results, documents, total } =
    useSearchPage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [queryDraft, setQueryDraft] = useSearchDebounce(filters.search, (v) => handleFilterChange('search', v))

  const hasAdvancedFilter = SEARCH_ADVANCED_FILTER_KEYS.some((key) => Boolean(filters[key]))
  const [filtersOpen, setFiltersOpen] = useState(hasAdvancedFilter)

  const totalPages = Math.max(1, Math.ceil(Math.max(total, 1) / PAGE_SIZE))

  const handleResetAll = () => {
    handleReset()
    setFiltersOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="חיפוש" description="חיפוש גלובלי על פני לקוחות, קלסרים ומסמכים" />

      <ToolbarContainer>
        <div className="space-y-3">
          <Input
            ref={inputRef}
            type="text"
            value={queryDraft}
            onChange={(e) => setQueryDraft(e.target.value)}
            placeholder={GLOBAL_SEARCH_PLACEHOLDER}
            startIcon={<SearchIcon className="h-4 w-4" />}
            autoFocus
          />
          <SearchFiltersBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetAll}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen((o) => !o)}
          />
        </div>
      </ToolbarContainer>

      {error && <Alert variant="error" message={error} />}

      {!loading && !error && !hasAnyFilter && (
        <StateCard
          icon={SearchIcon}
          title="מה תרצה למצוא?"
          message="הקלד שם לקוח, מספר קלסר, או השתמש בפילטרים המתקדמים"
          variant="illustration"
        />
      )}

      {!loading && !error && hasAnyFilter && results.length === 0 && documents.length === 0 && (
        <StateCard
          icon={FileSearch}
          title="לא נמצאו תוצאות"
          message="נסה להרחיב את קריטריוני החיפוש או לאפס את הפילטרים"
          action={{ label: 'איפוס חיפוש', onClick: handleResetAll }}
        />
      )}

      {(loading || results.length > 0) && (
        <>
          {!loading && (
            <p className="px-1 text-sm text-gray-500">
              נמצאו <strong className="text-gray-900">{formatCount(total + documents.length)}</strong> תוצאות
            </p>
          )}

          <DataTable<SearchResult>
            data={results}
            columns={searchColumns}
            getRowKey={(r) => `${r.result_type}-${r.client_record_id}-${r.binder_id ?? 'none'}`}
            isLoading={loading}
            emptyMessage="אין תוצאות"
          />

          {!loading && total > 0 && (
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
    </div>
  )
}
