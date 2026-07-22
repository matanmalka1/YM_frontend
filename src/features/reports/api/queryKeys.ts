export const reportsQK = {
  aging: (asOfDate: string, page: number, pageSize: number) => ['reports', 'aging', asOfDate, page, pageSize] as const,
  annualReportStatus: (taxYear: number) => ['reports', 'annual-report-status', taxYear] as const,
  advancePayments: (year: number, month?: number) => ['reports', 'advance-payments', year, month ?? null] as const,
  vatCompliance: (year: number, page: number, pageSize: number) => ['reports', 'vat-compliance', year, page, pageSize] as const,
} as const
