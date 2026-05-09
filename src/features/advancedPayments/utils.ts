import { getReportingPeriodMonthLabel, MONTH_NAMES } from '@/constants/periodOptions.constants'

export { fmtCurrency, MONTH_OPTIONS } from '../../utils/utils'
export { MONTH_NAMES }

export { ADVANCE_PAYMENT_STATUS_VARIANTS as STATUS_VARIANT } from '../../utils/enums'

export const getAdvancePaymentMonthLabel = (period: string, periodMonthsCount: 1 | 2 = 1) =>
  getReportingPeriodMonthLabel(period, periodMonthsCount)
