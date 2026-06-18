import { z } from 'zod'

export type EntityAuditType = 'client' | 'business' | 'charge' | 'annual_report'

const entityAuditLogEntrySchema = z.object({
  id: z.number(),
  entity_type: z.string(),
  entity_id: z.number(),
  performed_by: z.number(),
  performed_by_name: z.string().nullable(),
  action: z.string(),
  old_value: z.string().nullable(),
  new_value: z.string().nullable(),
  note: z.string().nullable(),
  performed_at: z.string(),
})

export type EntityAuditLogEntry = z.infer<typeof entityAuditLogEntrySchema>

export interface EntityAuditTrailParams {
  page?: number
  page_size?: number
  action?: string | null
  user_id?: number | null
  created_after?: string | null
  created_before?: string | null
}

export const entityAuditTrailResponseSchema = z.object({
  items: z.array(entityAuditLogEntrySchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
})

export type EntityAuditTrailResponse = z.infer<typeof entityAuditTrailResponseSchema>
