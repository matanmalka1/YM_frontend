import { formatCurrencyILS } from '@/utils/utils'

export type ReportMoneyValue = string | number | null | undefined

export const toReportNumber = (value: ReportMoneyValue): number => {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

export const formatILS = (value: ReportMoneyValue) => formatCurrencyILS(toReportNumber(value), { fractionDigits: 2 })
