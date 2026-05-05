import { createQueryKeys } from '@/lib/queryKeys'

export const vatReportsQK = {
  ...createQueryKeys(['tax', 'vat-work-items'] as const),
  lookup: (clientId: number, period: string) => ['tax', 'vat-work-items', 'lookup', clientId, period] as const,
  periodOptions: (clientId: number, year?: number) =>
    ['tax', 'vat-work-items', 'period-options', clientId, year ?? null] as const,
  forClient: (clientId: number) => ['tax', 'vat-work-items', 'client', clientId] as const,
  invoices: (id: number) => ['tax', 'vat-work-items', 'invoices', id] as const,
  audit: (id: number, params?: object) => ['tax', 'vat-work-items', 'audit', id, params ?? null] as const,
  clientSummary: (clientId: number) => ['tax', 'vat-work-items', 'client-summary', clientId] as const,
  groups: (params?: object) => ['tax', 'vat-work-items', 'groups', params ?? null] as const,
  groupItems: (groupKey: string, params?: object) =>
    ['tax', 'vat-work-items', 'groups', groupKey, 'items', params ?? null] as const,
}
