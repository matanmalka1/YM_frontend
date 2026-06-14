export const advancedPaymentsQK = {
  all: ['tax', 'advance-payments'] as const,
  forClientYear: (clientId: number, year: number) => ['tax', 'advance-payments', 'client', clientId, year] as const,
  overview: (params: object) => ['tax', 'advance-payments', 'overview', params] as const,
  kpi: (clientId: number, year: number) => ['tax', 'advance-payments', 'client', clientId, year, 'kpi'] as const,
  batches: (year: number | null, clientRecordId?: number) =>
    ['tax', 'advance-payments', 'batches', year, clientRecordId ?? null] as const,
} as const
