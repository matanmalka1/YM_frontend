import { createQueryKeys } from '@/lib/queryKeys'
import type { ClientImpactPreviewPayload, ListClientBusinessesParams } from './contracts'

export const clientsQK = {
  ...createQueryKeys('clients'),
  detail: (id: number, taxYear?: number) => ['clients', 'detail', id, taxYear ?? 'current'] as const,
  sidebar: (params: unknown) => ['clients', 'sidebar', params] as const,
  businessDetail: (clientId: number | 'none', businessId: number | 'none') =>
    ['clients', 'businesses', 'detail', clientId, businessId] as const,
  taxProfile: (id: number) => ['clients', 'tax-profile', id] as const,
  statusCard: (id: number, year?: number) => ['clients', 'status-card', id, year ?? 'current'] as const,
  businesses: (clientId: number, params?: ListClientBusinessesParams) =>
    params ? (['clients', 'businesses', clientId, params] as const) : (['clients', 'businesses', clientId] as const),
  businessesAll: (clientId: number) => ['clients', 'businesses', 'all', clientId] as const,
  businessesAllFallback: () => ['clients', 'businesses', 'all', 'none'] as const,
  firstBusiness: (clientId: number) => ['clients', 'businesses', 'first', clientId] as const,
  creationImpact: (params?: Partial<ClientImpactPreviewPayload> | null) =>
    [
      'clients',
      'creation-impact',
      params?.entity_type ?? null,
      params?.vat_reporting_frequency ?? null,
      params?.advance_payment_frequency ?? null,
      params?.advance_rate ?? null,
    ] as const,
  conflict: (idNumber: string) => ['clients', 'conflict', idNumber] as const,
}
