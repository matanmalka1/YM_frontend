import { createQueryKeys } from '@/lib/queryKeys'

export const vatReportsQK = {
  ...createQueryKeys(['tax', 'vat-work-items'] as const),
  lookup: (clientId: number, period: string) => ['tax', 'vat-work-items', 'lookup', clientId, period] as const,
  periodOptions: (clientId: number, year?: number) =>
    ['tax', 'vat-work-items', 'period-options', clientId, year ?? null] as const,
  forClient: (clientId: number) => ['tax', 'vat-work-items', 'client', clientId] as const,
  invoices: (id: number) => ['tax', 'vat-work-items', 'invoices', id] as const,
  clientSummaryRoot: (clientId: number) => ['tax', 'vat-work-items', 'client-summary', clientId] as const,
  clientSummary: (clientId: number, params?: { period_year_after?: number; period_year_before?: number }) =>
    ['tax', 'vat-work-items', 'client-summary', clientId, params ?? null] as const,
  statusSummaryRoot: () => ['tax', 'vat-work-items', 'status-summary'] as const,
  statusSummary: (params?: object) => ['tax', 'vat-work-items', 'status-summary', params ?? null] as const,
  groupsRoot: () => ['tax', 'vat-work-items', 'groups'] as const,
  groups: (params?: object) => ['tax', 'vat-work-items', 'groups', params ?? null] as const,
  groupItems: (groupKey: string, params?: object) =>
    ['tax', 'vat-work-items', 'groups', groupKey, 'items', params ?? null] as const,
}
