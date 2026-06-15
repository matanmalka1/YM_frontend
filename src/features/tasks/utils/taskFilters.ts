import { parsePositiveInt } from '@/utils/utils'
import { taskPriorityValues, taskStatusValues } from '../constants'
import { EMPTY_TASK_FILTERS, TASK_FILTER_PARAM_KEYS, TASKS_PAGE_SIZE } from '../taskPage.constants'
import type { TaskListParams, TaskPriority, TaskStatus } from '../api/contracts'
import type { TasksFilterValues } from '../types'
import type { UserRole } from '@/types'
import { workQueueSourceTypeValues, type WorkQueueSourceType } from '@/features/workQueue'

const isTaskStatus = (value: string | null): value is TaskStatus =>
  value !== null && taskStatusValues.includes(value as TaskStatus)

const isTaskPriority = (value: string | null): value is TaskPriority =>
  value !== null && taskPriorityValues.includes(value as TaskPriority)

const isTaskRole = (value: string | null): value is UserRole => value === 'advisor' || value === 'secretary'

const isWorkQueueSourceType = (value: string | null): value is WorkQueueSourceType =>
  value !== null && workQueueSourceTypeValues.includes(value as WorkQueueSourceType)

const getOptional = (searchParams: URLSearchParams, key: string): string => searchParams.get(key) ?? ''

export const getTaskFiltersFromSearchParams = (searchParams: URLSearchParams): TasksFilterValues => {
  const status = searchParams.get(TASK_FILTER_PARAM_KEYS.status)
  const priority = searchParams.get(TASK_FILTER_PARAM_KEYS.priority)
  const assignedRole = searchParams.get(TASK_FILTER_PARAM_KEYS.assignedRole)
  const assignedUserId = parsePositiveInt(searchParams.get(TASK_FILTER_PARAM_KEYS.assignedUser), 0)
  const sourceDomain = searchParams.get(TASK_FILTER_PARAM_KEYS.sourceDomain)

  return {
    ...EMPTY_TASK_FILTERS,
    status: isTaskStatus(status) ? status : '',
    priority: isTaskPriority(priority) ? priority : '',
    assignedRole: isTaskRole(assignedRole) ? assignedRole : '',
    assignedUser: assignedUserId > 0 ? String(assignedUserId) : '',
    sourceDomain: isWorkQueueSourceType(sourceDomain) ? sourceDomain : '',
    dueAfter: getOptional(searchParams, TASK_FILTER_PARAM_KEYS.dueAfter),
    dueBefore: getOptional(searchParams, TASK_FILTER_PARAM_KEYS.dueBefore),
  }
}

export const getTasksPageFromSearchParams = (searchParams: URLSearchParams): number =>
  parsePositiveInt(searchParams.get('page'), 1)

export const hasTaskFilters = (filters: TasksFilterValues): boolean => Object.values(filters).some(Boolean)

export const buildTaskListParams = (page: number, filters: TasksFilterValues): TaskListParams => ({
  page,
  page_size: TASKS_PAGE_SIZE,
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.priority ? { priority: filters.priority } : {}),
  ...(filters.assignedRole ? { assigned_role: filters.assignedRole } : {}),
  ...(filters.assignedUser ? { assigned_to_user_id: Number(filters.assignedUser) } : {}),
  ...(filters.sourceDomain ? { source_domain: filters.sourceDomain } : {}),
  ...(filters.dueBefore ? { due_before: filters.dueBefore } : {}),
  ...(filters.dueAfter ? { due_after: filters.dueAfter } : {}),
})
