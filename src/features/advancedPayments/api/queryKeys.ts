export const advancedPaymentsQK = {
  forClient: (clientId: number) => ['tax', 'advance-payments', 'client', clientId, 'all'] as const,
  all: ['tax', 'advance-payments'] as const,
  forClientYear: (clientId: number, year: number) => ['tax', 'advance-payments', 'client', clientId, year] as const,
  suggestion: (clientId: number, year: number, periodMonthsCount: 1 | 2) =>
    ['tax', 'advance-payments', 'client', clientId, year, periodMonthsCount, 'suggest'] as const,
  overview: (params: object) => ['tax', 'advance-payments', 'overview', params] as const,
  kpi: (clientId: number, year: number) => ['tax', 'advance-payments', 'client', clientId, year, 'kpi'] as const,
  batches: (year: number | null) => ['tax', 'advance-payments', 'batches', year] as const,
} as const
