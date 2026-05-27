import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { parsePositiveInt } from '../../../utils/utils'

export const useBindersFilters = () => {
  const { searchParams, setFilter, setPage, setSearchParams } = useSearchParamFilters()

  const filters = {
    location_status: searchParams.get('location_status') ?? '',
    client_record_id: parsePositiveInt(searchParams.get('client_record_id'), 0) || undefined,
    query: searchParams.get('query') ?? '',
    binder_number: searchParams.get('binder_number') ?? '',
    year: searchParams.get('year') ?? '',
    page: parsePositiveInt(searchParams.get('page'), 1),
    page_size: parsePositiveInt(searchParams.get('page_size'), 20),
    sort_by: searchParams.get('sort_by') ?? 'period_start',
    sort_dir: searchParams.get('sort_dir') ?? 'desc',
  }

  const handleFilterChange = (name: string, value: string) => setFilter(name, value)

  const handleReset = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('location_status')
    next.delete('query')
    next.delete('binder_number')
    next.delete('client_record_id')
    next.delete('year')
    next.set('page', '1')
    setSearchParams(next)
  }

  const handleSort = (sortBy: string) => {
    const currentDir = filters.sort_by === sortBy ? filters.sort_dir : 'desc'
    const nextDir = currentDir === 'desc' ? 'asc' : 'desc'
    const next = new URLSearchParams(searchParams)
    next.set('sort_by', sortBy)
    next.set('sort_dir', nextDir)
    next.set('page', '1')
    setSearchParams(next)
  }

  return { filters, setPage, handleFilterChange, handleReset, handleSort }
}
