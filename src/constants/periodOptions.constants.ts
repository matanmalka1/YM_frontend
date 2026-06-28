/** Shared YYYY-MM period regex. Matches backend PeriodStr. */
export const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

/** Label for records with no monthly period. */
export const NO_PERIOD_LABEL = 'ללא תקופה'

export const MONTHS_COVERED_OPTIONS = [
  { value: '1', label: 'חודשי' },
  { value: '2', label: 'דו-חודשי' },
]

/** Hebrew label for a months-covered count (1 = monthly, 2 = bimonthly). undefined when unset. */
export const getMonthsCoveredLabel = (months: 1 | 2 | null | undefined): string | undefined =>
  MONTHS_COVERED_OPTIONS.find((option) => option.value === String(months))?.label

export const BIMONTHLY_START_MONTH_VALUES = new Set(['1', '3', '5', '7', '9', '11'])

export const MONTH_NAMES = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
] as const

export const MONTH_OPTIONS = MONTH_NAMES.map((label, index) => ({
  value: String(index + 1),
  label,
}))

export const NUMERIC_MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1).padStart(2, '0'),
}))

/** Oct+ → next year; else current year. */
export const getOperationalTaxYear = (): number => {
  const now = new Date()
  return now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear()
}

/** 7 years descending from operational tax year. */
export const getOperationalYearOptions = (count = 7): { value: string; label: string }[] => {
  const top = getOperationalTaxYear()
  return Array.from({ length: count }, (_, i) => ({
    value: String(top - i),
    label: String(top - i),
  }))
}

const getPeriodLabel = (names: typeof MONTH_NAMES, period: string, periodMonthsCount: 1 | 2): string => {
  const month = Number(period.split('-')[1])
  const monthIndex = Number.isInteger(month) && month >= 1 && month <= 12 ? month - 1 : null
  if (monthIndex === null) return period
  if (periodMonthsCount === 1) return names[monthIndex]
  const endMonthIndex = monthIndex + periodMonthsCount - 1
  if (endMonthIndex >= names.length) return period
  return `${names[monthIndex]}-${names[endMonthIndex]}`
}

/**
 * Monthly period options across a year window centered on the current year (±yearSpan).
 * Values are `YYYY-MM`; labels default to `<month> <year>`, override via formatLabel.
 */
export const getMonthlyPeriodOptions = (
  yearSpan: number,
  formatLabel: (period: string) => string = (period) => getReportingPeriodLabelWithYear(period, 1, null),
): { value: string; label: string }[] => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: yearSpan * 2 + 1 }, (_, i) => currentYear - yearSpan + i).flatMap((year) =>
    Array.from({ length: 12 }, (_, m) => {
      const value = `${year}-${String(m + 1).padStart(2, '0')}`
      return { value, label: formatLabel(value) }
    }),
  )
}

export const getReportingPeriodMonthLabel = (period: string, periodMonthsCount: 1 | 2 = 1): string =>
  getPeriodLabel(MONTH_NAMES, period, periodMonthsCount)

/**
 * Full period label including the year, e.g. `ינואר 2026` or `ינואר-פברואר 2026`.
 * Falls back to the bare tax year (or a placeholder) when there is no monthly period.
 */
export const getReportingPeriodLabelWithYear = (
  period: string | null,
  periodMonthsCount: number | null,
  taxYear: number | null,
): string => {
  if (!period) return taxYear != null ? String(taxYear) : NO_PERIOD_LABEL
  if (!PERIOD_PATTERN.test(period)) return period

  const year = period.slice(0, 4)
  const monthsCount = periodMonthsCount === 2 ? 2 : 1
  return `${getReportingPeriodMonthLabel(period, monthsCount)} ${year}`
}
