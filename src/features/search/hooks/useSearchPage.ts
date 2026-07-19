import { useCallback } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchApi, searchQK } from '../api'
import { getErrorMessage, parsePositiveInt } from '../../../utils/utils'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { SEARCH_ADVANCED_FILTER_KEYS, type SearchFilters } from '../types'
import { PAGE_SIZE_SM } from '@/constants/pagination.constants'
import { SEARCH_ERROR_MESSAGES } from '../errorMessages'
import { useClientQuery } from '@/features/clients'

export const useSearchPage = () => {
  const { searchParams, getParam, getPage, setFilter, setPage: setUrlPage, resetFilters } = useSearchParamFilters()

  const filters: SearchFilters = {
    search: getParam('search'),
    client_record_id: getParam('client_record_id'),
    id_number: getParam('id_number'),
    binder_number: getParam('binder_number'),
    client_status: getParam('client_status'),
    entity_type: getParam('entity_type'),
    binder_location_status: getParam('binder_location_status'),
    binder_capacity_status: getParam('binder_capacity_status'),
    filename: getParam('filename'),
    page: getPage(),
    page_size: parsePositiveInt(searchParams.get('page_size'), PAGE_SIZE_SM),
  }
  const clientRecordId = parsePositiveInt(filters.client_record_id, 0) || null
  const { client: hydratedClientRecord } = useClientQuery({ clientId: clientRecordId })
  const hydratedClient = hydratedClientRecord
    ? {
        id: hydratedClientRecord.id,
        name: hydratedClientRecord.full_name,
        office_client_number: hydratedClientRecord.office_client_number,
      }
    : null

  const hasAnyFilter = Boolean(filters.search) || SEARCH_ADVANCED_FILTER_KEYS.some((k) => Boolean(filters[k]))

  const {
    data: searchData,
    error: searchError,
    isPending: searchPending,
  } = useQuery({
    queryKey: searchQK.results(filters),
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
        filename: filters.filename || undefined,
        page: filters.page,
        page_size: filters.page_size,
      }),
    enabled: hasAnyFilter,
    placeholderData: keepPreviousData,
  })

  const handleFilterChange = useCallback(
    (name: keyof SearchFilters, value: string) => {
      if (name === 'page') setUrlPage(Number(value))
      else setFilter(name, String(value))
    },
    [setFilter, setUrlPage],
  )

  const handleReset = useCallback(() => {
    resetFilters()
  }, [resetFilters])

  return {
    error: searchError ? getErrorMessage(searchError, SEARCH_ERROR_MESSAGES.page.loadError) : null,
    filters,
    hydratedClient,
    hasAnyFilter,
    handleFilterChange,
    handleReset,
    loading: hasAnyFilter ? searchPending : false,
    results: searchData?.results ?? [],
    documents: searchData?.documents ?? [],
    total: searchData?.total ?? 0,
  }
}
