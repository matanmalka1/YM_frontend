import type { ListAdvancePaymentsOverviewParams, ListAdvancePaymentsParams } from './contracts'

const normalizeListParams = (params: ListAdvancePaymentsParams) => ({
  client_record_id: params.client_record_id,
  year: params.year,
  status: params.status ?? null,
  page: params.page ?? 1,
  page_size: params.page_size ?? 20,
})

const normalizeOverviewParams = (params: ListAdvancePaymentsOverviewParams) => ({
  year: params.year,
  month: params.month ?? null,
  due_date: params.due_date ?? null,
  period_months_count: params.period_months_count ?? null,
  client_record_id: params.client_record_id ?? null,
  client_search: params.client_search ?? null,
  status: params.status ?? null,
  page: params.page ?? 1,
  page_size: params.page_size ?? 20,
})

export const advancedPaymentsQK = {
  all: ['tax', 'advance-payments'] as const,
  lists: () => [...advancedPaymentsQK.all, 'list'] as const,
  list: (params: ListAdvancePaymentsParams) => [...advancedPaymentsQK.lists(), normalizeListParams(params)] as const,
  clientYear: (clientRecordId: number, year: number) =>
    [...advancedPaymentsQK.lists(), 'client', clientRecordId, year] as const,
  overviews: () => [...advancedPaymentsQK.all, 'overview'] as const,
  overview: (params: ListAdvancePaymentsOverviewParams) =>
    [...advancedPaymentsQK.overviews(), normalizeOverviewParams(params)] as const,
  kpis: () => [...advancedPaymentsQK.all, 'kpi'] as const,
  kpi: (clientRecordId: number, year: number) =>
    [...advancedPaymentsQK.kpis(), 'client', clientRecordId, year] as const,
  batchesRoot: () => [...advancedPaymentsQK.all, 'batches'] as const,
  batches: (year: number | null, clientRecordId?: number) =>
    [...advancedPaymentsQK.batchesRoot(), { year, client_record_id: clientRecordId ?? null }] as const,
} as const
