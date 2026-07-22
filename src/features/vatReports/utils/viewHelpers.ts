import type { KeyboardEvent } from 'react'
import { formatClientOfficeId, getReportingPeriodMonthLabel } from '@/utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { VAT_NUMERIC_KEYS } from '../constants/vatConstants'
import type { VatPeriodRow, VatType } from '../api'

export const formatVatPeriodTitle = (period: string, periodType: VatType): string => {
  const [year] = period.split('-')
  const yearNumber = Number(year)
  const monthsCount = periodType === 'bimonthly' ? 2 : 1
  const monthLabel = getReportingPeriodMonthLabel(period, monthsCount).replace('-', '–')
  return Number.isInteger(yearNumber) && monthLabel !== period ? `${monthLabel} ${yearNumber}` : period
}

export const formatVatPeriodLabel = (period: string, isBimonthly: boolean): string =>
  formatVatPeriodTitle(period, isBimonthly ? 'bimonthly' : 'monthly')

export const getClientSummaryRowsForYear = (rows: VatPeriodRow[] | undefined, year: number | undefined): VatPeriodRow[] => {
  if (year === undefined) return []
  return (rows ?? []).filter((row) => row.period.startsWith(String(year))).sort((a, b) => a.period.localeCompare(b.period))
}

export const canOpenVatPeriodRow = (row: VatPeriodRow): boolean => Number.isInteger(row.work_item_id) && row.work_item_id > 0

export const getVatClientTitle = (name: string | null, clientRecordId: number): string =>
  name ?? `לקוח ${formatClientOfficeId(clientRecordId)}`

export const getNetVatTone = (value: string | number | null | undefined): string =>
  Number(value) >= 0 ? semanticMonoToneClasses.negative : semanticMonoToneClasses.positive

export const shouldRequireCounterpartyId = (invoiceType: 'income' | 'expense', documentType?: string): boolean =>
  invoiceType === 'expense' && documentType === 'tax_invoice'

export const blockNonNumericKey = (event: KeyboardEvent, allowDot = false): void => {
  const pattern = allowDot ? /[\d.]/ : /[\d]/
  if (!pattern.test(event.key) && !VAT_NUMERIC_KEYS.includes(event.key)) event.preventDefault()
}
