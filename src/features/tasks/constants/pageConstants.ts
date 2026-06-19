import { PAGE_SIZE_SM } from '@/constants/pagination.constants'
import { workQueueSourceTypeLabels, workQueueSourceTypeValues } from '@/features/workQueue'
import type { TaskPriority } from '../api/contracts'
import type { TasksFilterValues, TasksSelectOption } from '../types'
import type { UserRole } from '@/types'
import type { WorkQueueSourceType } from '@/features/workQueue'
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
  status: '',
  priority: '',
  assignedRole: '',
  assignedUser: '',
  sourceDomain: '',
  dueAfter: '',
  dueBefore: '',
}

export const TASK_FILTER_PARAM_KEYS = {
  status: 'status',
  priority: 'priority',
  assignedRole: 'assigned_role',
  assignedUser: 'assigned_to_user_id',
  sourceDomain: 'source_domain',
  dueAfter: 'due_after',
  dueBefore: 'due_before',
} as const

export type TaskFilterParamKey = (typeof TASK_FILTER_PARAM_KEYS)[keyof typeof TASK_FILTER_PARAM_KEYS]

export const TASK_TABLE_COLUMNS = ['כותרת', 'סטטוס', 'עדיפות', 'תאריך יעד', 'פעולות'] as const

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

export const taskSourceOptions: Array<TasksSelectOption<WorkQueueSourceType | ''>> = [
  { value: '', label: 'כל המקורות' },
  ...workQueueSourceTypeValues.map((value) => ({ value, label: workQueueSourceTypeLabels[value] })),
]

export const TASK_CONFIRM_COPY = {
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
