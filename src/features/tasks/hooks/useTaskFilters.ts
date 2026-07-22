import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { useDebounce } from 'use-debounce'
import { TASK_FILTER_PARAM_KEYS, type TaskFilterParamKey } from '../constants/pageConstants'
import { buildTaskListParams, getTaskFiltersFromSearchParams, hasTaskFilters } from '../utils/taskFilters'

export const useTaskFilters = (clientRecordId?: number) => {
  const { searchParams, getPage, setFilter, setFilters, setPage } = useSearchParamFilters()
  const page = getPage()
  const filters = getTaskFiltersFromSearchParams(searchParams)
  const [debouncedSearch] = useDebounce(filters.search, 350)

  const handleFilterChange = (key: TaskFilterParamKey, value: string) => {
    setFilter(key, value, true)
  }

  const resetTaskFilters = () => {
    setFilters(Object.fromEntries(Object.values(TASK_FILTER_PARAM_KEYS).map((k) => [k, ''])))
  }

  return {
    page,
    filters,
    hasFilters: hasTaskFilters(filters),
    listParams: buildTaskListParams(page, filters, clientRecordId, debouncedSearch),
    setPage,
    handleFilterChange,
    setFilters,
    resetFilters: resetTaskFilters,
  }
}
