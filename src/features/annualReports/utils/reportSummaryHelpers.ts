import type { SemanticTone } from '@/utils/semanticColors'
import { formatCurrencyILS } from '@/utils/utils'
import type { AnnualReportFull } from '../api'
import { ANNUAL_REPORTS_MESSAGES } from '../messages'

const M = ANNUAL_REPORTS_MESSAGES.summaryStrip

/** A single value in the compact financial summary strip. */
export interface ReportSummaryItem {
  key: string
  label: string
  /** Preformatted currency, or an em-dash when the value was never computed. */
  value: string
  /** Color is applied only when the sign carries real business meaning. */
  tone: SemanticTone
}

const toNumberOrNull = (value: string | null | undefined): number | null => {
  if (value == null || value === '') return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

/** Neutral item — sign has no positive/negative meaning (income, expenses). */
const neutralItem = (key: string, label: string, raw: string | null | undefined): ReportSummaryItem => ({
  key,
  label,
  value: formatCurrencyILS(raw),
  tone: 'neutral',
})

/**
 * Signed item — an amount whose sign flips both label and tone so a loss/refund
 * reads clearly instead of as a bare negative number. Uncomputed → neutral em-dash.
 */
const signedItem = (
  key: string,
  raw: string | null | undefined,
  labels: { positive: string; negative: string; zero: string },
  tones: { positive: SemanticTone; negative: SemanticTone },
): ReportSummaryItem => {
  const numeric = toNumberOrNull(raw)
  if (numeric === null) return { key, label: labels.zero, value: formatCurrencyILS(null), tone: 'neutral' }
  if (numeric > 0) return { key, label: labels.positive, value: formatCurrencyILS(numeric), tone: tones.positive }
  if (numeric < 0) return { key, label: labels.negative, value: formatCurrencyILS(-numeric), tone: tones.negative }
  return { key, label: labels.zero, value: formatCurrencyILS(0), tone: 'neutral' }
}

/**
 * Builds the compact financial summary: הכנסות · הוצאות · רווח/הפסד · מס · יתרה.
 * No percentages (no reliable baseline); uncomputed fields show "—", never a
 * misleading 0. `final_balance` follows the backend sign: positive = due, negative = refund.
 */
export const getReportSummaryItems = (report: AnnualReportFull): ReportSummaryItem[] => {
  const tc = report.tax_calculation

  return [
    neutralItem('income', M.income, tc?.total_income),
    neutralItem('expenses', M.expenses, tc?.recognized_expenses),
    signedItem(
      'profit',
      tc?.profit,
      { positive: M.netProfit, negative: M.loss, zero: M.netProfit },
      { positive: 'positive', negative: 'negative' },
    ),
    signedItem(
      'tax',
      tc?.tax_after_credits,
      { positive: M.taxDue, negative: M.taxRefund, zero: M.taxDue },
      { positive: 'neutral', negative: 'positive' },
    ),
    signedItem(
      'balance',
      tc?.final_balance,
      { positive: M.balanceDue, negative: M.balanceRefund, zero: M.balance },
      { positive: 'negative', negative: 'positive' },
    ),
  ]
}
