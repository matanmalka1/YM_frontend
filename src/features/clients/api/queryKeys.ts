import { createQueryKeys } from '@/lib/queryKeys'

export const clientsQK = {
  ...createQueryKeys('clients'),
  detail: (id: number, taxYear?: number) => ['clients', 'detail', id, taxYear ?? 'current'] as const,
  businessDetail: (clientId: number | 'none', businessId: number | 'none') =>
    ['clients', 'businesses', 'detail', clientId, businessId] as const,
  taxProfile: (id: number) => ['clients', 'tax-profile', id] as const,
  statusCard: (id: number, year?: number) => ['clients', 'status-card', id, year ?? 'current'] as const,
  businesses: (clientId: number) => ['clients', 'businesses', clientId] as const,
  businessesAll: (clientId: number) => ['clients', 'businesses', 'all', clientId] as const,
  businessesAllFallback: () => ['clients', 'businesses', 'all', 'none'] as const,
  firstBusiness: (clientId: number) => ['clients', 'businesses', 'first', clientId] as const,
  creationImpact: (entityType?: string | null, vatFrequency?: string | null) =>
    ['clients', 'creation-impact', entityType ?? null, vatFrequency ?? null] as const,
}
