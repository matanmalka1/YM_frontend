export type EntityAuditType = 'client' | 'business' | 'charge' | 'annual_report'

export interface EntityAuditLogEntry {
  id: number
  entity_type: string
  entity_id: number
  performed_by: number
  performed_by_name: string | null
  action: string
  old_value: string | null
  new_value: string | null
  note: string | null
  performed_at: string
}

export interface EntityAuditTrailParams {
  limit?: number
  offset?: number
}

export interface EntityAuditTrailResponse {
  items: EntityAuditLogEntry[]
  total: number
  limit: number
  offset: number
}
