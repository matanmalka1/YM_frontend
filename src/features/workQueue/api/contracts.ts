import { z } from 'zod'
import { workQueueSourceTypeValues, workQueueUrgencyValues } from '../constants'

export type WorkQueueSourceType = (typeof workQueueSourceTypeValues)[number]

export type WorkQueueUrgency = (typeof workQueueUrgencyValues)[number]

const baseWorkQueueItemSchema = z.object({
  source_type: z.enum(workQueueSourceTypeValues),
  source_id: z.number().int(),
  label: z.string(),
  due_date: z.string().nullable().optional(),
  urgency: z.enum(workQueueUrgencyValues),
  client_record_id: z.number().int().optional().nullable(),
  client_name: z.string().optional().nullable(),
  client_office_number: z.number().int().optional().nullable(),
  business_id: z.number().int().optional().nullable(),
})

export const advancePaymentWorkQueuePayloadSchema = z.object({
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

export const advancePaymentWorkQueueItemSchema = baseWorkQueueItemSchema.extend({
  source_type: z.literal('advance_payment'),
  payload: advancePaymentWorkQueuePayloadSchema,
})

const nonAdvanceSourceTypeSchema = z.enum(['vat_filing', 'annual_report', 'unpaid_charge', 'task'])

const genericWorkQueueItemSchema = baseWorkQueueItemSchema.extend({
  source_type: nonAdvanceSourceTypeSchema,
  payload: z.record(z.string(), z.unknown()).optional().nullable(),
})

export const workQueueItemSchema = z.discriminatedUnion('source_type', [
  advancePaymentWorkQueueItemSchema,
  genericWorkQueueItemSchema,
])

export type WorkQueueItem = z.infer<typeof workQueueItemSchema>
export type AdvancePaymentWorkQueueItem = z.infer<typeof advancePaymentWorkQueueItemSchema>

export interface WorkQueueParams {
  client_record_id?: number
  business_id?: number
  exclude_source_types?: WorkQueueSourceType[]
}
