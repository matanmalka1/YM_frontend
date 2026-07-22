import type { WorkItemSourceType } from '@/constants/workItemSources.constants'
import type { TaskPriority, TaskStatus } from './api/contracts'
import type { UserRole } from '@/types'

export interface TaskSourceContext {
  source_domain: WorkItemSourceType
  source_id: number
  title: string
  type_label?: string | null
  client_name?: string | null
  due_date?: string | null
  linked_tasks_count?: number
  linked_tasks?: Array<{ id: number; title: string; status: string }>
}

export interface UseTasksPageOptions {
  /** Pins the list and all mutations to one client-details context. */
  pinnedClientId?: number
}

export interface TasksFilterValues {
  search: string
  clientId: string
  clientName: string
  status: TaskStatus | ''
  priority: TaskPriority | ''
  assignedRole: UserRole | ''
  assignedUser: string
  sourceDomain: WorkItemSourceType | ''
  dueAfter: string
  dueBefore: string
  sortBy: 'created_at' | 'due_date' | 'priority' | 'title'
  order: 'asc' | 'desc'
}

export interface TasksSelectOption<TValue extends string = string> {
  value: TValue
  label: string
}

export type TaskModalState = { mode: 'create' } | { mode: 'edit' | 'view'; taskId: number } | null

export type TaskConfirmAction = 'complete' | 'cancel' | 'delete'

export interface TaskConfirmState {
  action: TaskConfirmAction
  taskId: number
}
