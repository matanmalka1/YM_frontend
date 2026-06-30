import { z } from 'zod'

export type EntityAuditType = 'client' | 'business' | 'charge' | 'annual_report'

// old_value / new_value / metadata_json are JSON objects (dict | list | null) —
// the backend stores them as JSONB and no longer json.dumps them into strings.
const auditJsonValueSchema = z.union([z.record(z.string(), z.unknown()), z.array(z.unknown())]).nullable()

const entityAuditLogEntrySchema = z.object({
  id: z.number(),
  entity_type: z.string(),
  entity_id: z.number(),
  performed_by: z.number().nullable(),
  performed_by_name: z.string().nullable(),
  actor_type: z.string(),
  actor_display_name: z.string().nullable(),
  action: z.string(),
  old_value: auditJsonValueSchema,
  new_value: auditJsonValueSchema,
  metadata_json: auditJsonValueSchema,
  note: z.string().nullable(),
  performed_at: z.string(),
})

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
  // True when the audited entity is soft- or hard-deleted; history stays readable.
  entity_deleted: z.boolean(),
})

export type EntityAuditTrailResponse = z.infer<typeof entityAuditTrailResponseSchema>
