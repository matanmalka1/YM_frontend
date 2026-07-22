import { PAGE_SIZE_SM } from '@/constants/pagination.constants'
import {
  workItemSourceTypeLabels as workQueueSourceTypeLabels,
  workItemSourceTypeValues as workQueueSourceTypeValues,
  type WorkItemSourceType,
} from '@/constants/workItemSources.constants'
import type { TaskPriority } from '../api/contracts'
import type { TasksFilterValues, TasksSelectOption } from '../types'
import type { UserRole } from '@/types'
import {
  taskStatusValues,
  taskStatusLabels,
  taskPriorityValues,
  taskPriorityLabels,
  taskRoleLabels,
  type TaskStatus,
} from './labels'

export const TASKS_PAGE_SIZE = PAGE_SIZE_SM

export const EMPTY_TASK_FILTERS: TasksFilterValues = {
  search: '',
  clientId: '',
  clientName: '',
  status: '',
  priority: '',
  assignedRole: '',
  assignedUser: '',
  sourceDomain: '',
  dueAfter: '',
  dueBefore: '',
  sortBy: 'created_at',
  order: 'desc',
}

export const TASK_FILTER_PARAM_KEYS = {
  search: 'search',
  clientId: 'client_record_id',
  clientName: 'client_name',
  status: 'status',
  priority: 'priority',
  assignedRole: 'assigned_role',
  assignedUser: 'assigned_to_user_id',
  sourceDomain: 'source_domain',
  dueAfter: 'due_after',
  dueBefore: 'due_before',
  sortBy: 'sort_by',
  order: 'order',
} as const

export type TaskFilterParamKey = (typeof TASK_FILTER_PARAM_KEYS)[keyof typeof TASK_FILTER_PARAM_KEYS]

export const taskStatusOptions: Array<TasksSelectOption<TaskStatus | ''>> = [
  { value: '', label: 'כל הסטטוסים' },
  ...taskStatusValues.map((value) => ({ value, label: taskStatusLabels[value] })),
]

export const taskPriorityOptions: Array<TasksSelectOption<TaskPriority | ''>> = [
  { value: '', label: 'כל העדיפויות' },
  ...taskPriorityValues.map((value) => ({ value, label: taskPriorityLabels[value] })),
]

export const taskRoleOptions: Array<TasksSelectOption<UserRole | ''>> = [
  { value: '', label: 'כל התפקידים' },
  { value: 'advisor', label: taskRoleLabels.advisor },
  { value: 'secretary', label: taskRoleLabels.secretary },
]

export const taskSourceOptions: Array<TasksSelectOption<WorkItemSourceType | ''>> = [
  { value: '', label: 'כל המקורות' },
  ...workQueueSourceTypeValues.map((value) => ({ value, label: workQueueSourceTypeLabels[value] })),
]

export const taskSortOptions = [
  { value: 'created_at', label: 'מועד יצירה' },
  { value: 'due_date', label: 'תאריך יעד' },
  { value: 'priority', label: 'עדיפות' },
  { value: 'title', label: 'כותרת' },
]

export const taskOrderOptions = [
  { value: 'desc', label: 'יורד' },
  { value: 'asc', label: 'עולה' },
]

export const TASK_CONFIRM_COPY = {
  complete: {
    title: 'השלמת משימה',
    message: 'לסמן את המשימה כהושלמה?',
    confirmLabel: 'סמן כהושלמה',
  },
  cancel: {
    title: 'ביטול משימה',
    message: 'לבטל את המשימה?',
    confirmLabel: 'בטל משימה',
  },
  delete: {
    title: 'מחיקת משימה',
    message: 'למחוק את המשימה?',
    confirmLabel: 'מחק משימה',
  },
} as const
