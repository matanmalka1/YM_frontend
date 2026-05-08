import type { EntityAuditType } from './contracts'

export const AUDIT_ENDPOINTS = {
  entityTrail: (entityType: EntityAuditType, entityId: number | string) => `/audit/${entityType}/${entityId}`,
} as const
