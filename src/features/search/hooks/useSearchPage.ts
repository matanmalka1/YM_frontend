import { useCallback, useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchApi, searchQK } from '../api'
import { getErrorMessage, parsePositiveInt } from '../../../utils/utils'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { SEARCH_ADVANCED_FILTER_KEYS, type SearchFilters } from '../types'

export const useSearchPage = () => {
  const { searchParams, setSearchParams } = useSearchParamFilters()

  const filters = useMemo<SearchFilters>(
    () => ({
      query: searchParams.get('query') ?? '',
      client_name: searchParams.get('client_name') ?? '',
      id_number: searchParams.get('id_number') ?? '',
      binder_number: searchParams.get('binder_number') ?? '',
      client_status: searchParams.get('client_status') ?? '',
      entity_type: searchParams.get('entity_type') ?? '',
      binder_location_status: searchParams.get('binder_location_status') ?? '',
      filename: searchParams.get('filename') ?? '',
      page: parsePositiveInt(searchParams.get('page'), 1),
      page_size: parsePositiveInt(searchParams.get('page_size'), 20),
    }),
    [searchParams],
  )

  const hasAnyFilter = Boolean(filters.query) || SEARCH_ADVANCED_FILTER_KEYS.some((k) => Boolean(filters[k]))

  const searchQuery = useQuery({
    queryKey: searchQK.results(filters),
    queryFn: () =>
      searchApi.search({
        query: filters.query || undefined,
        client_name: filters.client_name || undefined,
        id_number: filters.id_number || undefined,
        binder_number: filters.binder_number || undefined,
        client_status: filters.client_status || undefined,
        entity_type: filters.entity_type || undefined,
        binder_location_status: filters.binder_location_status || undefined,
        filename: filters.filename || undefined,
        page: filters.page,
        page_size: filters.page_size,
      }),
    enabled: hasAnyFilter,
    placeholderData: keepPreviousData,
  })

  const handleFilterChange = useCallback(
    (name: keyof SearchFilters, value: string) => {
      const next = new URLSearchParams(searchParams)
      if (name === 'page') {
        next.set('page', String(value))
      } else {
        if (String(value)) next.set(name, String(value))
        else next.delete(name)
        next.set('page', '1')
      }
      setSearchParams(next)
    },
    [searchParams, setSearchParams],
  )

  const handleReset = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  return {
    error: searchQuery.error ? getErrorMessage(searchQuery.error, 'שגיאה בטעינת תוצאות חיפוש') : null,
    filters,
    hasAnyFilter,
    handleFilterChange,
    handleReset,
    loading: hasAnyFilter ? searchQuery.isPending : false,
    results: searchQuery.data?.results ?? [],
    documents: searchQuery.data?.documents ?? [],
    total: searchQuery.data?.total ?? 0,
  }
}
