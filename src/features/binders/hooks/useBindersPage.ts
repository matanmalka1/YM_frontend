import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { bindersApi, bindersQK } from '../api'
import { getErrorMessage } from '../../../utils/utils'
import { useBindersFilters } from './useBindersFilters'
import { useBinderSelection } from './useBinderSelection'
import { useBinderMutations } from './useBinderMutations'

export const useBindersPage = () => {
  const { filters, setPage, handleFilterChange, handleReset, handleSort } = useBindersFilters()

  const listParams = {
    status: filters.status || undefined,
    client_record_id: filters.client_record_id || undefined,
    query: filters.query || undefined,
    binder_number: filters.binder_number || undefined,
    year: filters.year ? Number(filters.year) : undefined,
    page: filters.page,
    page_size: filters.page_size,
    sort_by: filters.sort_by,
    sort_dir: filters.sort_dir,
  }

  const bindersQuery = useQuery({
    queryKey: bindersQK.list(listParams),
    queryFn: () => bindersApi.list(listParams),
    placeholderData: keepPreviousData,
  })

  const pageItems = bindersQuery.data?.items ?? []
  const lastCountersRef = useRef({
    total: 0,
    in_office: 0,
    closed_in_office: 0,
    archived_in_office: 0,
    ready_for_pickup: 0,
    returned: 0,
  })

  useEffect(() => {
    if (bindersQuery.data?.counters) {
      lastCountersRef.current = bindersQuery.data.counters
    }
  }, [bindersQuery.data?.counters])

  const { deepLinkBinderId, selectedBinder, handleSelectBinder, handleCloseDrawer } = useBinderSelection(pageItems)

  const mutations = useBinderMutations(handleCloseDrawer)

  return {
    ...mutations,
    deepLinkBinderId,
    selectedBinder,
    binders: pageItems,
    total: bindersQuery.data?.total ?? 0,
    counters: bindersQuery.data?.counters ?? lastCountersRef.current,
    error: bindersQuery.error ? getErrorMessage(bindersQuery.error, 'שגיאה בטעינת רשימת קלסרים') : null,
    filters,
    handleFilterChange,
    handleReset,
    handleSort,
    setPage,
    handleSelectBinder,
    handleCloseDrawer,
    loading: bindersQuery.isPending,
  }
}
