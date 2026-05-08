import { useEntityAuditTrail } from '@/features/audit'

export const useClientAuditTrail = (clientId: number, page: number, pageSize: number) =>
  useEntityAuditTrail('client', clientId, page, pageSize)
