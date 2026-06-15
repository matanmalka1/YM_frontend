import type { WorkQueueSourceType } from '@/features/workQueue'
import type { TaskPriority, TaskStatus } from './api/contracts'
import type { UserRole } from '@/types'

export interface TaskSourceContext {
  source_domain: WorkQueueSourceType
  source_id: number
  title: string
  type_label?: string | null
  client_name?: string | null
  due_date?: string | null
  linked_tasks_count?: number
  linked_tasks?: Array<{ id: number; title: string; status: string }>
}

export interface TasksFilterValues {
  status: TaskStatus | ''
  priority: TaskPriority | ''
  assignedRole: UserRole | ''
  assignedUser: string
  sourceDomain: WorkQueueSourceType | ''
  dueAfter: string
  dueBefore: string
}

export interface TasksSelectOption<TValue extends string = string> {
  value: TValue
  label: string
}

export type TaskModalState = { mode: 'create' } | { mode: 'edit' | 'view'; taskId: number } | null

export type TaskConfirmAction = 'cancel' | 'delete'

export interface TaskConfirmState {
  action: TaskConfirmAction
  taskId: number
}
