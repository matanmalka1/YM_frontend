const REPORTING_PERIOD_PATTERN = /^(\d{4})-(\d{2})$/

const isValidCalendarMonth = (month: number): boolean => Number.isInteger(month) && month >= 1 && month <= 12

const normalizeMonthsCount = (value: number | null | undefined): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 1
  return Math.max(Math.floor(value), 1)
}

const toMonthIndex = (year: number, month: number): number => year * 12 + (month - 1)

export const reportingPeriodIncludesMonth = (
  periodYear: number,
  periodMonth: number,
  periodMonthsCount: number | null | undefined,
  targetYear: number,
  targetMonth: number,
): boolean => {
  if (!Number.isInteger(periodYear) || !Number.isInteger(targetYear)) return false
  if (!isValidCalendarMonth(periodMonth) || !isValidCalendarMonth(targetMonth)) return false

  const start = toMonthIndex(periodYear, periodMonth)
  const end = start + normalizeMonthsCount(periodMonthsCount) - 1
  const target = toMonthIndex(targetYear, targetMonth)

  return target >= start && target <= end
}

export const isCurrentReportingPeriod = (
  period: string | null | undefined,
  monthsCount: number | null | undefined = 1,
  now = new Date(),
): boolean => {
  if (!period) return false

  const match = REPORTING_PERIOD_PATTERN.exec(period)
  if (!match) return false

  return reportingPeriodIncludesMonth(Number(match[1]), Number(match[2]), monthsCount, now.getFullYear(), now.getMonth() + 1)
}
