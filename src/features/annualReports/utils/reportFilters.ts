export const ALL_ANNUAL_REPORT_YEARS = 'all'

export const getInitializedAnnualReportYear = (year: string, defaultTaxYear?: number): string | null => {
  if (year || defaultTaxYear == null) return null
  return String(defaultTaxYear)
}

export const getAnnualReportResetFilters = (defaultTaxYear?: number): Record<string, string> =>
  defaultTaxYear == null ? {} : { year: String(defaultTaxYear) }
