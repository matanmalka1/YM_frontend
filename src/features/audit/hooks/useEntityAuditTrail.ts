import { useQuery } from '@tanstack/react-query'
import { auditApi, auditQK, type EntityAuditType } from '../api'

export const useEntityAuditTrail = (entityType: EntityAuditType, entityId: number, page: number, pageSize: number) => {
  const params = { page: page + 1, page_size: pageSize }
  const query = useQuery({
    queryKey: auditQK.entityTrail(entityType, entityId, params),
    queryFn: () => auditApi.getEntityAuditTrail(entityType, entityId, params),
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
  }
}
