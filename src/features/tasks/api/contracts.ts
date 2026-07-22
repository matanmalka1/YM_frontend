import { z } from 'zod'
import type { UserRole } from '@/types'
import { workItemSourceTypeValues, type WorkItemSourceType } from '@/constants/workItemSources.constants'
import { taskStatusValues, taskPriorityValues } from '../constants/labels'
import type { TaskStatus } from '../constants/labels'

export type { TaskStatus } from '../constants/labels'
export type TaskPriority = (typeof taskPriorityValues)[number]

export const isTaskStatus = (value: string | null): value is TaskStatus =>
  value !== null && taskStatusValues.includes(value as TaskStatus)

export const parseTaskStatus = (value: string | null): TaskStatus | null => (isTaskStatus(value) ? value : null)

export const isTaskPriority = (value: string | null): value is TaskPriority =>
  value !== null && taskPriorityValues.includes(value as TaskPriority)

export const taskSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(taskStatusValues),
  priority: z.enum(taskPriorityValues),
  due_date: z.string().nullable().optional(),
  assigned_to_user_id: z.number().int().nullable().optional(),
  assigned_role: z.enum(['advisor', 'secretary']).nullable().optional(),
  source_domain: z.string().nullable().optional(),
  source_id: z.number().int().nullable().optional(),
  client_record_id: z.number().int().nullable().optional(),
  action_key: z.string().nullable().optional(),
  action_payload: z.record(z.string(), z.unknown()).nullable().optional(),
  created_by_user_id: z.number().int().nullable().optional(),
  completed_by_user_id: z.number().int().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  canceled_by_user_id: z.number().int().nullable().optional(),
  canceled_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  assigned_to_user_name: z.string().nullable().optional(),
  client_name: z.string().nullable().optional(),
  office_client_number: z.number().int().nullable().optional(),
  created_by_user_name: z.string().nullable().optional(),
  completed_by_user_name: z.string().nullable().optional(),
  canceled_by_user_name: z.string().nullable().optional(),
})

export type Task = z.infer<typeof taskSchema>

export const taskListResponseSchema = z.object({
  items: z.array(taskSchema),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
  summary: z.object({
    total: z.number().int(),
    open: z.number().int(),
    done: z.number().int(),
    canceled: z.number().int(),
  }),
})

export type TaskListResponse = z.infer<typeof taskListResponseSchema>

const taskLinkableSourceSchema = z.object({
  source_domain: z.enum(workItemSourceTypeValues),
  source_id: z.number().int(),
  title: z.string(),
  type_label: z.string().nullable().optional(),
  client_name: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  linked_tasks_count: z.number().int(),
})
export type TaskLinkableSource = z.infer<typeof taskLinkableSourceSchema>

export const taskLinkableSourceListSchema = z.object({
  items: z.array(taskLinkableSourceSchema),
  page: z.number().int(),
  page_size: z.number().int(),
  total: z.number().int(),
})
export type TaskLinkableSourceListResponse = z.infer<typeof taskLinkableSourceListSchema>

export interface TaskCreateRequest {
  title: string
  description?: string
  priority?: TaskPriority
  due_date?: string
  assigned_to_user_id?: number
  assigned_role?: UserRole
  source_domain?: WorkItemSourceType
  source_id?: number
  client_record_id?: number
  action_key?: string
  action_payload?: Record<string, unknown>
}

export interface TaskUpdateRequest {
  title?: string
  description?: string | null
  priority?: TaskPriority
  due_date?: string | null
  assigned_to_user_id?: number | null
  assigned_role?: UserRole | null
  source_domain?: WorkItemSourceType | null
  source_id?: number | null
  action_key?: string
  action_payload?: Record<string, unknown>
}

export const taskBulkActionResponseSchema = z.object({
  succeeded: z.array(z.number().int()),
  failed: z.array(
    z.object({
      task_id: z.number().int(),
      code: z.string(),
      message: z.string(),
    }),
  ),
})
export type TaskBulkActionResponse = z.infer<typeof taskBulkActionResponseSchema>

export interface TaskListParams {
  client_record_id?: number
  status?: TaskStatus
  priority?: TaskPriority
  assigned_to_user_id?: number
  assigned_role?: UserRole
  source_domain?: WorkItemSourceType
  source_id?: number
  due_before?: string
  due_after?: string
  search?: string
  sort_by?: 'created_at' | 'due_date' | 'priority' | 'title'
  order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}
