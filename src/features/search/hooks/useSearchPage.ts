import { useCallback, useRef, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchApi, searchQK } from '../api'
import { getErrorMessage, parsePositiveInt } from '@/utils/utils'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { SEARCH_ADVANCED_FILTER_KEYS, type SearchFilters } from '../types'
import { PAGE_SIZE_SM, PAGE_SIZE_MD } from '@/constants/pagination.constants'
import { SEARCH_ERROR_MESSAGES } from '../errorMessages'
import { useFilterClient } from '@/features/clients'
import type { SearchItem, SearchItemGroups, SearchItemType } from '../api/contracts'
import { useSearchDebounce } from '@/hooks/useSearchDebounce'
import { getTotalPages } from '@/utils/paginationUtils'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { SEARCH_MESSAGES } from '../messages'
import { SEARCH_GROUP_ORDER, SEARCH_GROUP_TYPES } from '../constants'
import type { SearchFeedChip } from '../components/SearchItemFeed'

const EMPTY_GROUP = { items: [], total: 0 }
const EMPTY_GROUPS: SearchItemGroups = {
  binders: EMPTY_GROUP,
  documents: EMPTY_GROUP,
  vat_work_items: EMPTY_GROUP,
  annual_reports: EMPTY_GROUP,
  advance_payments: EMPTY_GROUP,
  charges: EMPTY_GROUP,
  tasks: EMPTY_GROUP,
  notifications: EMPTY_GROUP,
}

const isSearchItemType = (value: string): value is SearchItemType =>
  Object.values(SEARCH_GROUP_TYPES).some((type) => type === value)

export const useSearchPage = () => {
  const {
    searchParams,
    getParam,
    getPage,
    setFilter,
    setFilters,
    setPage: setUrlPage,
    resetFilters,
  } = useSearchParamFilters()

  const filters: SearchFilters = {
    search: getParam('search'),
    client_record_id: getParam('client_record_id'),
    id_number: getParam('id_number'),
    binder_number: getParam('binder_number'),
    client_status: getParam('client_status'),
    entity_type: getParam('entity_type'),
    binder_location_status: getParam('binder_location_status'),
    binder_capacity_status: getParam('binder_capacity_status'),
    page: getPage(),
    page_size: parsePositiveInt(searchParams.get('page_size'), PAGE_SIZE_SM),
  }
  const rawType = getParam('type')
  const activeType = isSearchItemType(rawType) ? rawType : null

  const clientRecordId = parsePositiveInt(filters.client_record_id, 0) || null
  const hydratedClient = useFilterClient(clientRecordId)

  const hasAnyFilter = Boolean(filters.search) || SEARCH_ADVANCED_FILTER_KEYS.some((k) => Boolean(filters[k]))

  const handleFilterChange = useCallback(
    (name: keyof SearchFilters, value: string) => {
      if (name === 'page') setUrlPage(Number(value))
      else setFilter(name, String(value))
    },
    [setFilter, setUrlPage],
  )

  const {
    data,
    error: searchError,
    isPending: searchPending,
    isFetching: searchFetching,
  } = useQuery({
    queryKey: searchQK.clients(filters),
    queryFn: () =>
      searchApi.search({
        search: filters.search || undefined,
        client_record_id: clientRecordId ?? undefined,
        id_number: filters.id_number || undefined,
        binder_number: filters.binder_number || undefined,
        client_status: filters.client_status || undefined,
        entity_type: filters.entity_type || undefined,
        binder_location_status: filters.binder_location_status || undefined,
        binder_capacity_status: filters.binder_capacity_status || undefined,
        page: filters.page,
        page_size: filters.page_size,
      }),
    enabled: hasAnyFilter,
    placeholderData: keepPreviousData,
  })

  // `keepPreviousData` keeps the last response alive even once the query is disabled, so a
  // reset that clears every filter would otherwise leave the previous client's feed on
  // screen underneath the "nothing searched yet" prompt.
  const searchData = hasAnyFilter ? data : undefined

  const groups = searchData?.items ?? EMPTY_GROUPS
  const clientMatches = searchData?.clients
  // The backend auto-selects a single match; the feed belongs to whichever client that is.
  const selectedClientId = clientRecordId ?? (clientMatches?.total === 1 ? (clientMatches.items[0]?.id ?? null) : null)

  const {
    data: expandedData,
    error: expandedError,
    isPending: expandedPending,
  } = useQuery({
    queryKey: searchQK.items({
      client_record_id: selectedClientId ?? 0,
      result_type: activeType ?? 'task',
      page: filters.page,
      page_size: PAGE_SIZE_MD,
    }),
    queryFn: () =>
      searchApi.listItems({
        client_record_id: selectedClientId as number,
        result_type: activeType as SearchItemType,
        page: filters.page,
        page_size: PAGE_SIZE_MD,
      }),
    enabled: selectedClientId !== null && activeType !== null,
    placeholderData: keepPreviousData,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  // Every free-text filter is URL-backed, so each needs a local draft with a debounced
  // commit — otherwise each keystroke writes history and refires the request.
  const [queryDraft, setQueryDraft] = useSearchDebounce(filters.search, (value) => handleFilterChange('search', value))
  const [idNumberDraft, setIdNumberDraft] = useSearchDebounce(filters.id_number, (value) =>
    handleFilterChange('id_number', value),
  )
  const [binderNumberDraft, setBinderNumberDraft] = useSearchDebounce(filters.binder_number, (value) =>
    handleFilterChange('binder_number', value),
  )
  const hasAdvancedFilter = SEARCH_ADVANCED_FILTER_KEYS.some((key) => Boolean(filters[key]))
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(hasAdvancedFilter)

  const handleResetAll = useCallback(() => {
    resetFilters()
    setAdvancedFiltersOpen(false)
    inputRef.current?.focus()
  }, [resetFilters])

  // Selecting a client or a type restarts paging: both change what is being listed.
  const handleSelectClient = useCallback(
    (id: number) => setFilters({ client_record_id: String(id), page: '1' }),
    [setFilters],
  )
  const handleClearClient = useCallback(() => setFilters({ client_record_id: '', type: '', page: '1' }), [setFilters])
  const handleTypeChange = useCallback(
    (type: SearchItemType | null) => setFilters({ type: type ?? '', page: '1' }),
    [setFilters],
  )

  const chips: SearchFeedChip[] = SEARCH_GROUP_ORDER.filter((key) => groups[key].total > 0).map((key) => ({
    type: SEARCH_GROUP_TYPES[key],
    count: groups[key].total,
  }))
  const previewItems: SearchItem[] = SEARCH_GROUP_ORDER.flatMap((key) => groups[key].items)

  const error = searchError || expandedError
  const loading = hasAnyFilter && searchPending
  const expandedLoading = activeType !== null && selectedClientId !== null && expandedPending
  const showClientChooser = !loading && selectedClientId === null && (clientMatches?.total ?? 0) > 0
  const showFeed = !loading && selectedClientId !== null

  return {
    status: {
      isLoading: loading,
      // True while a *newer* result is in flight and stale rows are still displayed —
      // `isPending` stays false in that window because of `keepPreviousData`.
      isFetching: hasAnyFilter && searchFetching && !loading,
      error: error ? getErrorMessage(error, SEARCH_ERROR_MESSAGES.page.loadError) : null,
    },
    headerProps: {
      title: GLOBAL_UI_MESSAGES.common.search,
      description: SEARCH_MESSAGES.page.description,
    },
    toolbar: {
      inputRef,
      queryDraft,
      onQueryDraftChange: setQueryDraft,
      filters,
      textDrafts: {
        id_number: { value: idNumberDraft, onChange: setIdNumberDraft },
        binder_number: { value: binderNumberDraft, onChange: setBinderNumberDraft },
      },
      hydratedClient,
      onFilterChange: handleFilterChange,
      onReset: handleResetAll,
      advancedFiltersOpen,
      onToggleAdvancedFilters: () => setAdvancedFiltersOpen((open) => !open),
    },
    results: {
      prompt: { visible: !loading && !error && !hasAnyFilter },
      emptyState: {
        visible: !loading && !error && hasAnyFilter && (clientMatches?.total ?? 0) === 0,
        onReset: handleResetAll,
      },
      selectedClient: {
        // Both paths land here: an explicit pick filters the list to that client, and an
        // auto-selected single match is the only row in it.
        visible: showFeed,
        client: clientMatches?.items[0] ?? null,
        onChange: clientRecordId !== null ? handleClearClient : null,
      },
      clientMatches: {
        visible: showClientChooser,
        data: clientMatches?.items ?? [],
        total: clientMatches?.total ?? 0,
        onSelect: handleSelectClient,
      },
      feed: {
        visible: showFeed,
        chips,
        activeType,
        onTypeChange: handleTypeChange,
        items: activeType ? (expandedData?.items ?? []) : previewItems,
        isLoading: expandedLoading,
        pagination:
          activeType && expandedData
            ? {
                page: expandedData.page,
                totalPages: getTotalPages(expandedData.total, expandedData.page_size),
                total: expandedData.total,
                onPageChange: setUrlPage,
              }
            : null,
      },
    },
  }
}
