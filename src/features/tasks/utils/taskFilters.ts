import { parsePositiveInt } from '@/utils/utils'
import { EMPTY_TASK_FILTERS, TASK_FILTER_PARAM_KEYS, TASKS_PAGE_SIZE } from '../constants/pageConstants'
import { isTaskPriority, isTaskStatus, type TaskListParams } from '../api/contracts'
import type { TasksFilterValues } from '../types'
import type { UserRole } from '@/types'
import { isWorkItemSourceType } from '@/constants/workItemSources.constants'

const isTaskRole = (value: string | null): value is UserRole => value === 'advisor' || value === 'secretary'

export const getTaskFiltersFromSearchParams = (searchParams: URLSearchParams): TasksFilterValues => {
  const status = searchParams.get(TASK_FILTER_PARAM_KEYS.status)
  const priority = searchParams.get(TASK_FILTER_PARAM_KEYS.priority)
  const assignedRole = searchParams.get(TASK_FILTER_PARAM_KEYS.assignedRole)
  const assignedUserId = parsePositiveInt(searchParams.get(TASK_FILTER_PARAM_KEYS.assignedUser), 0)
  const sourceDomain = searchParams.get(TASK_FILTER_PARAM_KEYS.sourceDomain)
  const clientId = parsePositiveInt(searchParams.get(TASK_FILTER_PARAM_KEYS.clientId), 0)
  const sortBy = searchParams.get(TASK_FILTER_PARAM_KEYS.sortBy)
  const order = searchParams.get(TASK_FILTER_PARAM_KEYS.order)

  return {
    ...EMPTY_TASK_FILTERS,
    search: searchParams.get(TASK_FILTER_PARAM_KEYS.search) ?? '',
    clientId: clientId > 0 ? String(clientId) : '',
    clientName: searchParams.get(TASK_FILTER_PARAM_KEYS.clientName) ?? '',
    status: isTaskStatus(status) ? status : '',
    priority: isTaskPriority(priority) ? priority : '',
    assignedRole: isTaskRole(assignedRole) ? assignedRole : '',
    assignedUser: assignedUserId > 0 ? String(assignedUserId) : '',
    sourceDomain: isWorkItemSourceType(sourceDomain) ? sourceDomain : '',
    dueAfter: searchParams.get(TASK_FILTER_PARAM_KEYS.dueAfter) ?? '',
    dueBefore: searchParams.get(TASK_FILTER_PARAM_KEYS.dueBefore) ?? '',
    sortBy:
      sortBy === 'due_date' || sortBy === 'priority' || sortBy === 'title' || sortBy === 'created_at' ? sortBy : 'created_at',
    order: order === 'asc' ? 'asc' : 'desc',
  }
}

export const hasTaskFilters = (filters: TasksFilterValues): boolean =>
  Boolean(
    filters.search ||
    filters.clientId ||
    filters.status ||
    filters.priority ||
    filters.assignedRole ||
    filters.assignedUser ||
    filters.sourceDomain ||
    filters.dueAfter ||
    filters.dueBefore ||
    filters.sortBy !== 'created_at' ||
    filters.order !== 'desc',
  )

export const buildTaskListParams = (
  page: number,
  filters: TasksFilterValues,
  clientRecordId?: number,
  debouncedSearch = filters.search,
): TaskListParams => ({
  page,
  page_size: TASKS_PAGE_SIZE,
  ...(clientRecordId
    ? { client_record_id: clientRecordId }
    : filters.clientId
      ? { client_record_id: Number(filters.clientId) }
      : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.priority ? { priority: filters.priority } : {}),
  ...(filters.assignedRole ? { assigned_role: filters.assignedRole } : {}),
  ...(filters.assignedUser ? { assigned_to_user_id: Number(filters.assignedUser) } : {}),
  ...(filters.sourceDomain ? { source_domain: filters.sourceDomain } : {}),
  ...(filters.dueBefore ? { due_before: filters.dueBefore } : {}),
  ...(filters.dueAfter ? { due_after: filters.dueAfter } : {}),
  ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  sort_by: filters.sortBy,
  order: filters.order,
})
