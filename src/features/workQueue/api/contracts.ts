import { z } from 'zod'
import { workQueueSourceTypeValues, workQueueUrgencyValues } from '../constants'

export type WorkQueueSourceType = (typeof workQueueSourceTypeValues)[number]

export type WorkQueueUrgency = (typeof workQueueUrgencyValues)[number]

export const workQueueItemSchema = z.object({
  source_type: z.enum(workQueueSourceTypeValues),
  source_id: z.number().int(),
  label: z.string(),
  due_date: z.string(),
  urgency: z.enum(workQueueUrgencyValues),
  client_record_id: z.number().int().optional().nullable(),
  client_name: z.string().optional().nullable(),
  business_id: z.number().int().optional().nullable(),
  payload: z.record(z.string(), z.unknown()).optional().nullable(),
})

export type WorkQueueItem = z.infer<typeof workQueueItemSchema>

export interface WorkQueueParams {
  client_record_id?: number
  business_id?: number
  exclude_source_types?: WorkQueueSourceType[]
}
