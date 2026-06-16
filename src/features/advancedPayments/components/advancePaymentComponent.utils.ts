import { BIMONTHLY_START_MONTH_VALUES, getReportingPeriodMonthLabel } from '@/constants/periodOptions.constants'
import type { CreateAdvancePaymentFormValues } from '../schemas'
import type { AdvancePaymentStatus, CreateAdvancePaymentPayload } from '../api/contracts'
import { MONTH_OPTIONS } from '@/utils/utils'
import { DEFAULT_BIMONTHLY_START_MONTH } from './advancePaymentComponent.constants'

export const getAdvancePaymentMonthLabel = (period: string, periodMonthsCount: 1 | 2 = 1) =>
  getReportingPeriodMonthLabel(period, periodMonthsCount)

export const getCollectionPercent = (rate: string | number | null, cap = false) => {
  if (rate === null) return null
  const numericRate = Number(rate)
  if (!Number.isFinite(numericRate)) return null
  const roundedRate = Math.round(numericRate)
  return cap ? Math.min(roundedRate, 100) : roundedRate
}

export const toggleAdvancePaymentStatusFilter = (
  currentStatuses: AdvancePaymentStatus[],
  status: AdvancePaymentStatus,
) =>
  currentStatuses.includes(status)
    ? currentStatuses.filter((currentStatus) => currentStatus !== status)
    : [...currentStatuses, status]

export const getAdvancePaymentMonthOptions = (periodMonthsCount: 1 | 2) =>
  periodMonthsCount === 2
    ? MONTH_OPTIONS.filter((option) => BIMONTHLY_START_MONTH_VALUES.has(option.value)).map((option) => ({
        ...option,
        label: getAdvancePaymentMonthLabel(`2026-${String(option.value).padStart(2, '0')}`, 2),
      }))
    : MONTH_OPTIONS

export const getValidBimonthlyMonth = (month: number) =>
  BIMONTHLY_START_MONTH_VALUES.has(String(month)) ? month : DEFAULT_BIMONTHLY_START_MONTH

export const toNumberOrNull = (value: string) => (value === '' ? null : Number(value))

export const toStringOrNull = (value: string | number | null | undefined) =>
  value == null || value === '' ? null : String(value)

export const toEditableAmount = (value: string | null) => (value == null ? '' : String(value))

/** Advance amount = turnover × rate%, as a 2-decimal string. Callers guard inputs. */
export const calcAdvanceAmount = (turnover: number, ratePercent: number) =>
  ((turnover * ratePercent) / 100).toFixed(2)

export const toFrequency = (value: string) => Number(value) as 1 | 2

const toPeriod = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`

export const buildCreateAdvancePaymentPayload = (
  year: number,
  data: CreateAdvancePaymentFormValues,
): CreateAdvancePaymentPayload => ({
  period: toPeriod(year, data.month),
  period_months_count: data.period_months_count,
  turnover_amount: toStringOrNull(data.turnover_amount),
  advance_rate: toStringOrNull(data.advance_rate),
  override_amount: toStringOrNull(data.override_amount),
  paid_amount: toStringOrNull(data.paid_amount),
  notes: data.notes ?? null,
})
