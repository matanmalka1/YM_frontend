import type {
  AdvancePaymentMethod,
  AdvancePaymentOverviewRow,
  AdvancePaymentRow,
  AdvancePaymentStatus,
  AdvancePaymentTimingStatus,
} from '../api/contracts'
import { formatPercent } from '@/utils/utils'

export type AdvancePaymentDrawerRow = AdvancePaymentRow | AdvancePaymentOverviewRow

export interface AdvancePaymentDrawerContext {
  clientName?: string | null
  clientIdNumber?: string | null
  officeClientNumber?: number | null
}

/**
 * Flat, drawer-specific view of an advance payment row.
 *
 * The drawer is fed by two backend DTOs: {@link AdvancePaymentRow} (client tab)
 * and {@link AdvancePaymentOverviewRow} (overview page). They expose different
 * subsets of fields — only `AdvancePaymentOverviewRow` carries client identity,
 * only `AdvancePaymentRow` carries `paid_at`/`notes`/`paid_late`. Identity for
 * the client-tab case is supplied by the caller via context props.
 *
 * `toAdvancePaymentDrawerModel` resolves all of that once so the rest of the
 * drawer sees a single concrete shape.
 */
export interface AdvancePaymentDrawerModel {
  id: number
  clientRecordId: number
  period: string
  periodMonthsCount: 1 | 2

  // identity / context
  clientDisplayName: string | null
  officeClientNumber: number | null
  idNumber: string | null
  advanceRate: string | null

  // period details
  dueDate: string
  dueDateEffective: string | null
  timingStatus: AdvancePaymentTimingStatus
  paidLate: boolean
  missingTurnover: boolean
  liveTurnover: string | null

  // amounts / payment
  expectedAmount: string
  paidAmount: string
  status: AdvancePaymentStatus
  paymentMethod: AdvancePaymentMethod | null
  paidAt: string | null
  notes: string | null
  turnoverAmount: string | null
  overrideAmount: string | null
  calculatedAmount: string | null
}

const getOfficeClientNumber = (row: AdvancePaymentDrawerRow) =>
  'office_client_number' in row ? (row.office_client_number ?? null) : null

const getIdNumber = (row: AdvancePaymentDrawerRow) => ('id_number' in row ? (row.id_number ?? null) : null)

const getPaidAt = (row: AdvancePaymentDrawerRow) => ('paid_at' in row ? row.paid_at : null)

const getNotes = (row: AdvancePaymentDrawerRow) => ('notes' in row ? row.notes : null)

const getPaidLate = (row: AdvancePaymentDrawerRow) => ('paid_late' in row ? row.paid_late : false)

const getCalculatedAmount = (row: AdvancePaymentDrawerRow) =>
  'calculated_amount' in row ? (row.calculated_amount ?? null) : null

export const toAdvancePaymentDrawerModel = (
  row: AdvancePaymentDrawerRow,
  context: AdvancePaymentDrawerContext,
): AdvancePaymentDrawerModel => ({
  id: row.id,
  clientRecordId: row.client_record_id,
  period: row.period,
  periodMonthsCount: row.period_months_count,

  clientDisplayName: context.clientName ?? row.business_name ?? null,
  officeClientNumber: getOfficeClientNumber(row) ?? context.officeClientNumber ?? null,
  idNumber: getIdNumber(row) ?? context.clientIdNumber ?? null,
  advanceRate: row.advance_rate,

  dueDate: row.due_date,
  dueDateEffective: row.due_date_effective ?? null,
  timingStatus: row.timing_status,
  paidLate: getPaidLate(row),
  missingTurnover: row.missing_turnover,
  liveTurnover: row.live_turnover,

  expectedAmount: row.expected_amount,
  paidAmount: row.paid_amount,
  status: row.status,
  paymentMethod: row.payment_method,
  paidAt: getPaidAt(row),
  notes: getNotes(row),
  turnoverAmount: row.turnover_amount ?? null,
  overrideAmount: row.override_amount ?? null,
  calculatedAmount: getCalculatedAmount(row),
})

export const formatAdvanceRate = (value: string | null | undefined) => {
  if (value == null || value === '') return null
  return formatPercent(value, { fractionDigits: 2, fallback: `${value}%` })
}
