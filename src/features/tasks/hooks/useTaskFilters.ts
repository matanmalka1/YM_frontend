import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { TASK_FILTER_PARAM_KEYS } from '../taskPage.constants'
import {
  buildTaskListParams,
  getTaskFiltersFromSearchParams,
  hasTaskFilters,
} from '../utils/taskFilters'
import type { TaskPriority, TaskStatus } from '../api/contracts'
import type { UserRole } from '@/types'
import type { WorkQueueSourceType } from '@/features/workQueue'

export const useTaskFilters = () => {
  const { searchParams, getPage, setFilter, setFilters, setPage } = useSearchParamFilters()
  const page = getPage()
  const filters = getTaskFiltersFromSearchParams(searchParams)

  const setTaskFilter = (key: string, value: string) => {
    setFilter(key, value, true)
  }

  const resetTaskFilters = () => {
    setFilters(Object.fromEntries(Object.values(TASK_FILTER_PARAM_KEYS).map((k) => [k, ''])))
  }

  return {
    page,
    filters,
    hasFilters: hasTaskFilters(filters),
    listParams: buildTaskListParams(page, filters),
    setPage,
    setStatusFilter: (value: TaskStatus | '') => setTaskFilter(TASK_FILTER_PARAM_KEYS.status, value),
    setPriorityFilter: (value: TaskPriority | '') => setTaskFilter(TASK_FILTER_PARAM_KEYS.priority, value),
    setAssignedRoleFilter: (value: UserRole | '') => setTaskFilter(TASK_FILTER_PARAM_KEYS.assignedRole, value),
    setAssignedUserFilter: (value: string) => setTaskFilter(TASK_FILTER_PARAM_KEYS.assignedUser, value),
    setSourceDomainFilter: (value: WorkQueueSourceType | '') =>
      setTaskFilter(TASK_FILTER_PARAM_KEYS.sourceDomain, value),
    setDueAfterFilter: (value: string) => setTaskFilter(TASK_FILTER_PARAM_KEYS.dueAfter, value),
    setDueBeforeFilter: (value: string) => setTaskFilter(TASK_FILTER_PARAM_KEYS.dueBefore, value),
    resetFilters: resetTaskFilters,
  }
}
