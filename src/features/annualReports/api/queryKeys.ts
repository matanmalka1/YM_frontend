import { createQueryKeys } from '@/lib/queryKeys'
import type { TaxPreviewParams } from './contracts'

export const annualReportsQK = {
  ...createQueryKeys(['tax', 'annual-reports'] as const),
  seasonSummary: (taxYear: number) => ['tax', 'annual-reports', 'season', taxYear, 'summary'] as const,
  seasonList: (taxYear: number) => ['tax', 'annual-reports', 'season', taxYear, 'list'] as const,
  defaultTaxYear: ['tax', 'annual-reports', 'default-tax-year'] as const,
  activeSeasonSummary: ['tax', 'annual-reports', 'season', 'active', 'summary'] as const,
  activeSeasonList: ['tax', 'annual-reports', 'season', 'active', 'list'] as const,
  overdue: (taxYear: number) => ['tax', 'annual-reports', 'overdue', taxYear] as const,
  forClient: (clientId: number) => ['tax', 'annual-reports', 'client', clientId] as const,
  financials: (id: number) => ['tax', 'annual-reports', 'financials', id] as const,
  readiness: (id: number) => ['tax', 'annual-reports', 'readiness', id] as const,
  taxCalc: (id: number) => ['tax', 'annual-reports', id, 'tax-calc'] as const,
  annex: (id: number, schedule: string) => ['tax', 'annual-reports', id, 'annex', schedule] as const,
  taxPreview: (params: TaxPreviewParams) => ['tax', 'annual-reports', 'tax-preview', params] as const,
}
