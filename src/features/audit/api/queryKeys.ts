import type { EntityAuditTrailParams, EntityAuditType } from './contracts'

export const auditQK = {
  entityTrail: (entityType: EntityAuditType, entityId: number, params?: EntityAuditTrailParams) =>
    ['audit', entityType, entityId, params ?? null] as const,
}
