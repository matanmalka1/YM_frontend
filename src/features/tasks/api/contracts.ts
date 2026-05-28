import { z } from 'zod'
import type { PaginatedResponse } from '@/types'
import { taskStatusValues, taskPriorityValues } from '../constants'

export type TaskStatus = (typeof taskStatusValues)[number]
export type TaskPriority = (typeof taskPriorityValues)[number]

export const taskSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(taskStatusValues),
  priority: z.enum(taskPriorityValues),
  due_date: z.string().nullable().optional(),
  assigned_to_user_id: z.number().int().nullable().optional(),
  assigned_role: z.string().nullable().optional(),
  source_domain: z.string().nullable().optional(),
  source_id: z.number().int().nullable().optional(),
  action_key: z.string().nullable().optional(),
  action_payload: z.record(z.string(), z.unknown()).nullable().optional(),
  created_by_user_id: z.number().int().nullable().optional(),
  completed_by_user_id: z.number().int().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  canceled_by_user_id: z.number().int().nullable().optional(),
  canceled_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Task = z.infer<typeof taskSchema>

export const taskListResponseSchema = z.object({
  items: z.array(taskSchema),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
})

export type TaskListResponse = z.infer<typeof taskListResponseSchema>

export interface TaskCreateRequest {
  title: string
  description?: string
  priority?: TaskPriority
  due_date?: string
  assigned_to_user_id?: number
  assigned_role?: string
  source_domain?: string
  source_id?: number
  action_key?: string
  action_payload?: Record<string, unknown>
}

export interface TaskUpdateRequest {
  title?: string
  description?: string
  priority?: TaskPriority
  due_date?: string
  assigned_to_user_id?: number
  assigned_role?: string
  source_domain?: string | null
  source_id?: number | null
  action_key?: string
  action_payload?: Record<string, unknown>
}

export interface TaskListParams {
  status?: TaskStatus
  priority?: TaskPriority
  assigned_to_user_id?: number
  assigned_role?: string
  source_domain?: string
  source_id?: number
  due_before?: string
  due_after?: string
  page?: number
  page_size?: number
}

export type TasksListResponse = PaginatedResponse<Task>
