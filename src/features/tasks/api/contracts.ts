import { z } from 'zod'
import { taskTypeValues, taskUrgencyValues } from '../constants'

export type TaskType = (typeof taskTypeValues)[number]

export type TaskUrgency = (typeof taskUrgencyValues)[number]

export const deadlineTaskSchema = z.object({
  item_type: z.literal('task'),
  source_type: z.enum(taskTypeValues),
  source_id: z.number().int(),
  label: z.string(),
  due_date: z.string(),
  urgency: z.enum(taskUrgencyValues),
  client_record_id: z.number().int(),
  business_id: z.number().int().optional().nullable(),
})

export const unifiedItemSchema = z.object({
  item_type: z.enum(['task', 'reminder']),
  source_type: z.string(),
  source_id: z.number().int(),
  label: z.string(),
  due_date: z.string(),
  urgency: z.string().optional().nullable(),
  client_record_id: z.number().int().optional().nullable(),
  client_name: z.string().optional().nullable(),
  business_id: z.number().int().optional().nullable(),
  payload: z.record(z.string(), z.unknown()).optional().nullable(),
})

export type DeadlineTask = z.infer<typeof deadlineTaskSchema>
export type UnifiedItem = z.infer<typeof unifiedItemSchema>

export interface TasksParams {
  client_record_id?: number
  business_id?: number
  exclude_source_types?: TaskType[]
  include_reminders?: boolean
}
