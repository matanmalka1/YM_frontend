import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { AUDIT_ENDPOINTS } from './endpoints'
import {
  entityAuditTrailResponseSchema,
  type EntityAuditTrailParams,
  type EntityAuditTrailResponse,
  type EntityAuditType,
} from './contracts'

export const auditApi = {
  getEntityAuditTrail: async (
    entityType: EntityAuditType,
    entityId: number,
    params: EntityAuditTrailParams = {},
  ): Promise<EntityAuditTrailResponse> => {
    const response = await api.get<EntityAuditTrailResponse>(AUDIT_ENDPOINTS.entityTrail(entityType, entityId), {
      params: toQueryParams(params),
    })
    return entityAuditTrailResponseSchema.parse(response.data)
  },
}
