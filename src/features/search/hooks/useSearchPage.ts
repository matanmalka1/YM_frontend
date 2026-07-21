import { useCallback, useEffect, useRef } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchApi, searchQK } from '../api'
import { getErrorMessage, parsePositiveInt } from '@/utils/utils'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import type { SearchFilters } from '../types'
import { PAGE_SIZE_SM, PAGE_SIZE_MD } from '@/constants/pagination.constants'
import { SEARCH_ERROR_MESSAGES } from '../errorMessages'
import type { SearchMatchGroups, SearchMatchType } from '../api/contracts'
import { useSearchDebounce } from '@/hooks/useSearchDebounce'
import { getTotalPages } from '@/utils/paginationUtils'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { SEARCH_MESSAGES } from '../messages'
import { SEARCH_DROPPED_FILTER_KEYS, isSearchMatchType } from '../utils/searchUrlValues'
import { clientsPageFor, searchMatchChips } from '../utils/searchMatches'

const EMPTY_GROUP = { items: [], total: 0 }
const EMPTY_GROUPS: SearchMatchGroups = {
  binders: EMPTY_GROUP,
  documents: EMPTY_GROUP,
  vat_work_items: EMPTY_GROUP,
  annual_reports: EMPTY_GROUP,
  advance_payments: EMPTY_GROUP,
  charges: EMPTY_GROUP,
  tasks: EMPTY_GROUP,
  notifications: EMPTY_GROUP,
}

export const useSearchPage = () => {
  const { searchParams, getParam, getPage, setFilters, setPage: setUrlPage, resetFilters } = useSearchParamFilters()

  // The URL is untrusted input: the term is trimmed (a whitespace-only term is not a search and
  // the API 422s it), and `type` — the one guarded param left — must be a SearchMatchType.
  const filters: SearchFilters = {
    search: getParam('search').trim(),
    page: getPage(),
    page_size: parsePositiveInt(searchParams.get('page_size'), PAGE_SIZE_SM),
  }
  const rawType = getParam('type')
  const activeType = isSearchMatchType(rawType) ? rawType : null
  const hasTerm = Boolean(filters.search)

  // Params the page cannot honor are dropped from the URL in one write rather than carried
  // around: the deleted filter/selection params of old deep links, and a `type` the enum
  // rejects — sending either would 422 the whole search.
  const staleParams = [
    ...(rawType && activeType === null ? ['type'] : []),
    ...SEARCH_DROPPED_FILTER_KEYS.filter((key) => getParam(key)),
  ].join(',')

  useEffect(() => {
    if (!staleParams) return
    setFilters(Object.fromEntries(staleParams.split(',').map((key) => [key, ''])), false)
  }, [staleParams, setFilters])

  // `page` pages whichever list the user is in (§7.3): the clients list while no type is
  // expanded, the expanded match list once one is — the clients section then shows its first
  // page with no pager, so the request pins it to page one.
  const searchRequest = {
    search: filters.search,
    page: clientsPageFor(activeType, filters.page),
    page_size: filters.page_size,
  }

  const {
    data,
    error: searchError,
    isPending: searchPending,
    isFetching: searchFetching,
  } = useQuery({
    queryKey: searchQK.clients(searchRequest),
    queryFn: () => searchApi.search(searchRequest),
    enabled: hasTerm,
    placeholderData: keepPreviousData,
  })

  // `keepPreviousData` keeps the last response alive even once the query is disabled, so a
  // cleared term would otherwise leave the previous results on screen under the prompt.
  const searchData = hasTerm ? data : undefined

  const groups = searchData?.matches ?? EMPTY_GROUPS
  const clientMatches = searchData?.clients
  const chips = searchMatchChips(groups)
  const hasMatches = chips.length > 0
  const clientTotal = clientMatches?.total ?? 0

  const matchesRequest = {
    search: filters.search,
    result_type: activeType ?? ('task' as SearchMatchType),
    page: filters.page,
    page_size: PAGE_SIZE_MD,
  }

  const {
    data: expandedData,
    error: expandedError,
    isPending: expandedPending,
  } = useQuery({
    queryKey: searchQK.matches(matchesRequest),
    queryFn: () => searchApi.listMatches(matchesRequest),
    enabled: hasTerm && activeType !== null,
    placeholderData: keepPreviousData,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  // The term is URL-backed, so it needs a local draft with a debounced commit — otherwise each
  // keystroke writes history and refires the request. Committing a new term drops the expanded
  // type in the same write: the expansion belonged to the previous term's matches.
  const handleSearchChange = useCallback((value: string) => setFilters({ search: value.trim(), type: '' }), [setFilters])
  const [queryDraft, setQueryDraft] = useSearchDebounce(filters.search, handleSearchChange)
  // A typed change is committed only after the debounce, so between the keystroke and the request
  // the rows on screen answer the previous term. That window counts as fetching, or the stale
  // results read as an answer to what was just typed.
  const hasPendingTextEdit = queryDraft.trim() !== filters.search

  const handleResetAll = useCallback(() => {
    resetFilters()
    inputRef.current?.focus()
  }, [resetFilters])

  // Expanding, switching, or clearing a type restarts paging — one atomic URL write.
  const handleTypeChange = useCallback(
    (type: SearchMatchType | null) => setFilters({ type: type ?? '', page: '1' }),
    [setFilters],
  )

  const error = searchError || expandedError
  const loading = hasTerm && searchPending

  return {
    status: {
      isLoading: loading,
      // True while a *newer* result is pending and stale rows are still displayed — both while the
      // debounce holds the edit back and while the request runs. `isPending` stays false in that
      // window because of `keepPreviousData`.
      isFetching: !loading && (hasPendingTextEdit || (hasTerm && searchFetching)),
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
    },
    results: {
      prompt: { visible: !loading && !error && !hasTerm },
      // The page's one no-match state: the term resolved to no client and matched no record.
      emptyState: {
        visible: !loading && !error && hasTerm && clientTotal === 0 && !hasMatches,
        onReset: handleResetAll,
      },
      clientMatches: {
        visible: !loading && clientTotal > 0,
        clients: clientMatches?.items ?? [],
        total: clientTotal,
        // The pager appears only while `page` is this list's page (§7.3).
        pagination:
          activeType === null && clientMatches
            ? {
                page: clientMatches.page,
                totalPages: getTotalPages(clientMatches.total, clientMatches.page_size),
                total: clientMatches.total,
                onPageChange: setUrlPage,
              }
            : null,
      },
      matches: {
        visible: !loading && hasMatches,
        chips,
        activeType,
        onTypeChange: handleTypeChange,
        groups,
        expanded:
          activeType === null
            ? null
            : {
                items: expandedData?.items ?? [],
                isLoading: expandedPending,
                pagination: expandedData
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
