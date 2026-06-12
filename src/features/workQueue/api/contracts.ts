import { z } from 'zod'
import { workQueueSourceTypeValues, workQueueUrgencyValues } from '../constants'
import type { WorkQueueSourceType, WorkQueueUrgency } from '../constants'
import { taskStatusValues } from '@/features/tasks'

export type { WorkQueueSourceType, WorkQueueUrgency }

const workQueueActionSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(['link', 'mutation', 'modal']),
  route: z.string().nullable().optional(),
  endpoint: z.string().nullable().optional(),
  method: z.enum(['get', 'post', 'patch', 'put', 'delete']).nullable().optional(),
  task_id: z.number().int().nullable().optional(),
  payload_schema: z.enum(['none', 'simple', 'requires_input']).optional(),
  confirm: z.boolean().optional(),
  confirm_title: z.string().nullable().optional(),
  confirm_message: z.string().nullable().optional(),
  variant: z.enum(['primary', 'secondary', 'danger']).nullable().optional(),
  disabled: z.boolean().optional(),
  disabled_reason: z.string().nullable().optional(),
})

const linkedTaskSummarySchema = z.object({
  id: z.number().int(),
  title: z.string(),
  status: z.string(),
  due_date: z.string().nullable().optional(),
  priority: z.string().nullable().optional(),
  assigned_user_id: z.number().int().nullable().optional(),
  assigned_role: z.string().nullable().optional(),
})

const workQueueWarningSchema = z.object({
  key: z.string(),
  label: z.string(),
  severity: z.enum(['info', 'warning', 'danger']),
})

const sourceSummarySchema = z.object({
  source_type: z.string(),
  source_id: z.number().int(),
  label: z.string(),
  route: z.string().nullable().optional(),
})

const baseWorkQueueItemSchema = z.object({
  id: z.string(),
  source_type: z.enum(workQueueSourceTypeValues),
  source_id: z.number().int(),
  title: z.string(),
  description: z.string().nullable().optional(),
  type_label: z.string().nullable().optional(),
  status_label: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  urgency: z.enum(workQueueUrgencyValues),
  client_record_id: z.number().int().optional().nullable(),
  client_name: z.string().optional().nullable(),
  office_client_number: z.number().int().optional().nullable(),
  business_id: z.number().int().optional().nullable(),
  source_summary: sourceSummarySchema.nullable().optional(),
  linked_tasks: z.array(linkedTaskSummarySchema),
  linked_tasks_count: z.number().int(),
  warnings: z.array(workQueueWarningSchema),
  available_actions: z.array(workQueueActionSchema),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
})

const advancePaymentWorkQueueMetadataSchema = z.object({
  period: z.string(),
  period_label: z.string().optional().nullable(),
  period_months_count: z.number().int(),
  frequency: z.enum(['monthly', 'bimonthly']),
  due_date: z.string().nullable(),
  status: z.string(),
  expected_amount: z.string().nullable(),
  paid_amount: z.string().nullable(),
  remaining_amount: z.string().nullable(),
  payment_method: z.string().nullable(),
  paid_at: z.string().nullable(),
  annual_report_id: z.number().int().nullable(),
})

const advancePaymentWorkQueueItemSchema = baseWorkQueueItemSchema.extend({
  source_type: z.literal('advance_payment'),
  metadata: advancePaymentWorkQueueMetadataSchema,
})

const nonAdvanceSourceTypeSchema = z.enum(['vat_work_item', 'annual_report', 'charge', 'binder', 'task'])

const genericWorkQueueItemSchema = baseWorkQueueItemSchema.extend({
  source_type: nonAdvanceSourceTypeSchema,
})

const workQueueItemSchema = z.discriminatedUnion('source_type', [
  advancePaymentWorkQueueItemSchema,
  genericWorkQueueItemSchema,
])

export type WorkQueueItem = z.infer<typeof workQueueItemSchema>
export type WorkQueueAction = z.infer<typeof workQueueActionSchema>
export type WorkQueueWarning = z.infer<typeof workQueueWarningSchema>

const workQueueSummarySchema = z.object({
  total: z.number().int(),
  manual_tasks: z.number().int(),
  linked: z.number().int(),
  unlinked: z.number().int(),
  overdue: z.number().int(),
  approaching: z.number().int(),
  important: z.number().int(),
  upcoming: z.number().int(),
  by_source_type: z.record(z.enum(workQueueSourceTypeValues), z.number().int()),
  by_task_status: z.record(z.enum(taskStatusValues), z.number().int()),
})

export type WorkQueueSummary = z.infer<typeof workQueueSummarySchema>

export const workQueueListResponseSchema = z.object({
  items: z.array(workQueueItemSchema),
  total: z.number().int(),
  summary: workQueueSummarySchema,
})

export type WorkQueueListResponse = z.infer<typeof workQueueListResponseSchema>

export interface WorkQueueParams {
  client_record_id?: number
  business_id?: number
  exclude_source_types?: WorkQueueSourceType[]
  include_task_history?: boolean
  search?: string
  source_type?: WorkQueueSourceType
  urgency?: WorkQueueUrgency
  task_status?: (typeof taskStatusValues)[number]
  linked?: 'linked' | 'unlinked'
  scope?: 'system' | 'manual'
  page?: number
  page_size?: number
}
