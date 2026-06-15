import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { parsePositiveInt } from '../../../utils/utils'
import { isBinderCapacityStatus, isBinderLocationStatus, isBinderSortBy, isBinderSortOrder } from '../constants'
import type { BinderSortBy, BindersFilterUpdates, BindersUrlFilters } from '../types'

export const useBindersFilters = () => {
  const { searchParams, getParam, getPage, setFilter, setFilters, setPage } = useSearchParamFilters()
  const rawYear = searchParams.get('year')
  const parsedYear = parsePositiveInt(rawYear, 0)
  const rawLocationStatus = searchParams.get('location_status')
  const rawCapacityStatus = searchParams.get('capacity_status')
  const rawSortBy = searchParams.get('sort_by')
  const rawOrder = searchParams.get('order')

  const filters: BindersUrlFilters = {
    location_status: isBinderLocationStatus(rawLocationStatus) ? rawLocationStatus : '',
    capacity_status: isBinderCapacityStatus(rawCapacityStatus) ? rawCapacityStatus : '',
    client_record_id: parsePositiveInt(searchParams.get('client_record_id'), 0) || undefined,
    client_name: getParam('client_name'),
    binder_number: getParam('binder_number'),
    year: parsedYear ? String(parsedYear) : '',
    page: getPage(),
    page_size: parsePositiveInt(searchParams.get('page_size'), 20),
    sort_by: isBinderSortBy(rawSortBy) ? rawSortBy : 'period_start',
    order: isBinderSortOrder(rawOrder) ? rawOrder : 'desc',
  }

  const handleFilterChange = (name: string, value: string) => setFilter(name, value)

  const handleMultiFilterChange = (updates: BindersFilterUpdates) => {
    const normalizedUpdates: Record<string, string> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) normalizedUpdates[key] = value
    }
    setFilters(normalizedUpdates)
  }

  const handleReset = () => {
    setFilters({
      location_status: '',
      capacity_status: '',
      query: '',
      binder_number: '',
      client_record_id: '',
      client_name: '',
      year: '',
    })
  }

  const handleSort = (sortBy: BinderSortBy) => {
    const currentDir = filters.sort_by === sortBy ? filters.order : 'desc'
    const nextDir = currentDir === 'desc' ? 'asc' : 'desc'
    setFilters({ sort_by: sortBy, order: nextDir })
  }

  return { filters, setPage, handleFilterChange, handleMultiFilterChange, handleReset, handleSort }
}
