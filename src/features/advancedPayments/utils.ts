import {
  getReportingPeriodMonthLabel,
  MONTH_NAMES,
} from '@/constants/periodOptions.constants'

export { fmtCurrency, MONTH_OPTIONS } from '../../utils/utils'
export { MONTH_NAMES }

export { ADVANCE_PAYMENT_STATUS_VARIANTS as STATUS_VARIANT } from '../../utils/enums'

export const getAdvancePaymentMonthLabel = (period: string, periodMonthsCount: 1 | 2 = 1) =>
  getReportingPeriodMonthLabel(period, periodMonthsCount)

export const getAdvancePaymentDueDateFallback = (batch: {
  year: number
  month: number
  period_months_count: 1 | 2
}) => {
  const dueMonthIndex = batch.month + batch.period_months_count
  const dueYear = batch.year + Math.floor((dueMonthIndex - 1) / 12)
  const dueMonth = ((dueMonthIndex - 1) % 12) + 1
  // TODO: Remove this fallback once MonthBatchSummary returns due_date from the backend.
  return `${dueYear}-${String(dueMonth).padStart(2, '0')}-15`
}
