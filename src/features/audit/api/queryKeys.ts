import type { EntityAuditTrailParams, EntityAuditType } from './contracts'

export const auditQK = {
  // Prefix key for invalidation; `entityTrail` keys match under it.
  entityRoot: (entityType: EntityAuditType, entityId: number) => ['audit', entityType, entityId] as const,
  entityTrail: (entityType: EntityAuditType, entityId: number, params?: EntityAuditTrailParams) =>
    ['audit', entityType, entityId, params ?? null] as const,
}
