import { useCallback, useEffect, useRef, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchApi, searchQK } from '../api'
import { getErrorMessage, parsePositiveInt } from '@/utils/utils'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { SEARCH_ADVANCED_FILTER_KEYS, type SearchFilters } from '../types'
import { PAGE_SIZE_SM, PAGE_SIZE_MD } from '@/constants/pagination.constants'
import { SEARCH_ERROR_MESSAGES } from '../errorMessages'
import type { SearchItem, SearchItemGroups, SearchItemType } from '../api/contracts'
import { useSearchDebounce } from '@/hooks/useSearchDebounce'
import { getTotalPages } from '@/utils/paginationUtils'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { SEARCH_MESSAGES } from '../messages'
import { SEARCH_GROUP_ORDER, SEARCH_GROUP_TYPES } from '../constants'
import {
  clientSelectionUpdate,
  isResolutionFilterKey,
  resolutionFilterUpdate,
  resolveSelectedClient,
} from '../utils/searchSelection'
import { SEARCH_DROPPED_FILTER_KEYS, parseSearchEnumFilters } from '../utils/searchUrlValues'
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
  const { searchParams, getParam, getPage, setFilter, setFilters, setPage: setUrlPage, resetFilters } = useSearchParamFilters()

  // The URL is untrusted input, so every param is parsed before it is used: enum-backed filters
  // through their owning feature's guard, free text trimmed. A whitespace-only term arriving by
  // deep link is not a search, and would otherwise match every client as `%%`.
  const { values: enumFilters, invalidKeys } = parseSearchEnumFilters({
    client_status: getParam('client_status'),
    entity_type: getParam('entity_type'),
    binder_location_status: getParam('binder_location_status'),
    binder_capacity_status: getParam('binder_capacity_status'),
  })

  const filters: SearchFilters = {
    ...enumFilters,
    search: getParam('search').trim(),
    client_record_id: getParam('client_record_id'),
    page: getPage(),
    page_size: parsePositiveInt(searchParams.get('page_size'), PAGE_SIZE_SM),
  }
  const rawType = getParam('type')
  const activeType = isSearchItemType(rawType) ? rawType : null

  // The URL asks for this client; only client resolution can grant it.
  const requestedClientId = parsePositiveInt(filters.client_record_id, 0) || null

  const hasAdvancedFilter = SEARCH_ADVANCED_FILTER_KEYS.some((key) => Boolean(filters[key]))
  // A picked client is reason enough to search, even though it is a selection rather than a filter.
  const hasAnyFilter = Boolean(filters.search) || Boolean(filters.client_record_id) || hasAdvancedFilter

  // One atomic URL write per change: the filter itself plus whatever it invalidates. The selection
  // sits in the URL beside the filters that produced it, so a filter that changes which clients
  // resolve drops the old pick, its expanded type, and its page in the same navigation.
  const handleFilterChange = useCallback(
    (name: keyof SearchFilters, value: string) => {
      if (name === 'page') setUrlPage(Number(value))
      else if (name === 'client_record_id') setFilters(clientSelectionUpdate(parsePositiveInt(value, 0) || null))
      else if (isResolutionFilterKey(name)) setFilters(resolutionFilterUpdate(name, value))
      else setFilter(name, value)
    },
    [setFilter, setFilters, setUrlPage],
  )

  // `page` pages whichever list the user is in: the client matches while they are still choosing,
  // the expanded feed once a type is open. Resolution therefore stays on page one while a type is
  // expanded — paging the feed would otherwise page the selected client out of the match window
  // and leave the feed with no client to name.
  const resolutionParams = {
    search: filters.search || undefined,
    client_record_id: requestedClientId ?? undefined,
    client_status: filters.client_status || undefined,
    entity_type: filters.entity_type || undefined,
    binder_location_status: filters.binder_location_status || undefined,
    binder_capacity_status: filters.binder_capacity_status || undefined,
    page: activeType === null ? filters.page : 1,
    page_size: filters.page_size,
  }

  const {
    data,
    error: searchError,
    isPending: searchPending,
    isFetching: searchFetching,
  } = useQuery({
    queryKey: searchQK.clients(resolutionParams),
    queryFn: () => searchApi.search(resolutionParams),
    enabled: hasAnyFilter,
    placeholderData: keepPreviousData,
  })

  // `keepPreviousData` keeps the last response alive even once the query is disabled, so a
  // reset that clears every filter would otherwise leave the previous client's feed on
  // screen underneath the "nothing searched yet" prompt.
  const searchData = hasAnyFilter ? data : undefined

  const groups = searchData?.items ?? EMPTY_GROUPS
  const clientMatches = searchData?.clients
  // The one selection truth on this page: the client the current filters actually resolved to.
  // A `client_record_id` the filters exclude resolves to nothing, so nothing of it is shown.
  const selectedClient = resolveSelectedClient(clientMatches, requestedClientId)
  const selectedClientId = selectedClient?.id ?? null

  // Params the page cannot honor are dropped from the URL rather than carried around: an enum
  // value the API rejects would 422 the whole search, and a `type` whose client the current
  // filters do not resolve keeps `page` pointing at a feed that is not on screen. The type is
  // judged only once resolution has settled, so a deep link keeps its type while it loads.
  const resolutionSettled = !hasAnyFilter || (!searchPending && !searchFetching)
  const hasStaleType = activeType !== null && selectedClient === null && resolutionSettled
  const staleParams = [...invalidKeys, ...(hasStaleType ? ['type'] : []), ...SEARCH_DROPPED_FILTER_KEYS.filter((key) => getParam(key))].join(',')

  useEffect(() => {
    if (!staleParams) return
    setFilters(Object.fromEntries(staleParams.split(',').map((key) => [key, ''])), false)
  }, [staleParams, setFilters])

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
  // A typed change is committed only after the debounce, so between the keystroke and the request
  // the rows on screen answer the previous term. That window counts as fetching, or the stale
  // results read as an answer to what was just typed.
  const hasPendingTextEdit = queryDraft.trim() !== filters.search
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(hasAdvancedFilter)

  // Whether the panel is open is the user's business, with one exception: arriving at a URL that
  // already carries advanced filters has to show the criteria narrowing the results, or the user
  // reads a short list with no visible reason. `useState`'s initial value covers only the first
  // render, so a deep link followed inside the app — or back/forward onto one — needs this. It
  // fires only when the URL flips from "no advanced filter" to "some", which leaves a manual
  // collapse alone: the flag stays true while the user closes the panel and edits filters.
  useEffect(() => {
    if (hasAdvancedFilter) setAdvancedFiltersOpen(true)
  }, [hasAdvancedFilter])

  const handleResetAll = useCallback(() => {
    resetFilters()
    setAdvancedFiltersOpen(false)
    inputRef.current?.focus()
  }, [resetFilters])

  // Selecting a client or a type restarts paging: both change what is being listed.
  const handleSelectClient = useCallback((id: number) => setFilters(clientSelectionUpdate(id)), [setFilters])
  const handleClearClient = useCallback(() => setFilters(clientSelectionUpdate(null)), [setFilters])
  const handleTypeChange = useCallback((type: SearchItemType | null) => setFilters({ type: type ?? '', page: '1' }), [setFilters])

  const chips: SearchFeedChip[] = SEARCH_GROUP_ORDER.filter((key) => groups[key].total > 0).map((key) => ({
    type: SEARCH_GROUP_TYPES[key],
    count: groups[key].total,
  }))
  const previewItems: SearchItem[] = SEARCH_GROUP_ORDER.flatMap((key) => groups[key].items)

  const error = searchError || expandedError
  const loading = hasAnyFilter && searchPending
  const expandedLoading = activeType !== null && selectedClientId !== null && expandedPending
  const showClientChooser = !loading && selectedClient === null && (clientMatches?.total ?? 0) > 0

  return {
    status: {
      isLoading: loading,
      // True while a *newer* result is pending and stale rows are still displayed — both while the
      // debounce holds the edit back and while the request runs. `isPending` stays false in that
      // window because of `keepPreviousData`.
      isFetching: !loading && (hasPendingTextEdit || (hasAnyFilter && searchFetching)),
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
      clientMatches: {
        visible: showClientChooser,
        clients: clientMatches?.items ?? [],
        total: clientMatches?.total ?? 0,
        onSelect: handleSelectClient,
        // Only the chooser is on screen here, so `page` is its page: the feed cannot be open
        // while several clients still match.
        pagination: clientMatches
          ? {
              page: clientMatches.page,
              totalPages: getTotalPages(clientMatches.total, clientMatches.page_size),
              total: clientMatches.total,
              onPageChange: setUrlPage,
            }
          : null,
      },
      // Client heading and feed are one slot: the feed is that client's records, so it is never
      // shown without them, and never for a client the current filters did not resolve to.
      selected:
        loading || selectedClient === null
          ? null
          : {
              client: selectedClient,
              // Absent when the term resolved to this client alone — there is nothing to go back to.
              onChange: requestedClientId !== null ? handleClearClient : null,
              feed: {
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
    },
  }
}
