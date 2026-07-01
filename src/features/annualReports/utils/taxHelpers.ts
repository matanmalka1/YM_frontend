import { formatCurrencyILS, formatPercent } from '@/utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import {
  CREDIT_POINT_VALUE_BY_YEAR,
  DEFAULT_CREDIT_POINT_VALUE,
  PENSION_DEDUCTION_RATE,
} from '../constants/taxConstants'
import type { AnnualReportFull } from '../api'

export interface CreditRow {
  label: string
  description: string
  amount: number
}

export const toTaxInputValues = (detail: AnnualReportFull | undefined) => ({
  pension: detail?.pension_contribution != null ? String(detail.pension_contribution) : '',
  otherCredits: detail?.other_credits != null ? String(detail.other_credits) : '',
})

// Credit points are computed server-side from credit-point rows and are not
// editable via PATCH /details (AnnualReportDetailUpdateRequest forbids extras).
export const toReportDetailsPayload = (pension: string, otherCredits: string) => ({
  pension_contribution: pension !== '' ? pension : undefined,
  other_credits: otherCredits !== '' ? otherCredits : undefined,
})

export const toTaxResultPayload = (liability: number) =>
  liability > 0
    ? { tax_due: String(liability), refund_due: null }
    : { tax_due: null, refund_due: String(Math.abs(liability)) }

const getCreditPointValue = (taxYear: number) => CREDIT_POINT_VALUE_BY_YEAR[taxYear] ?? DEFAULT_CREDIT_POINT_VALUE

export const getTotalCredits = (data: {
  credit_points_value: string | number
  donation_credit: string | number
  other_credits?: string | number | null
}) => Number(data.credit_points_value) + Number(data.donation_credit) + Number(data.other_credits ?? 0)

export const getLiabilityTone = (liability: number | null) => {
  if (liability === null) return ''
  return liability > 0 ? 'text-negative-600' : 'text-positive-600'
}

export const fmtRate = (rate: string | number) => formatPercent(rate, { isRatio: true, fractionDigits: 0 })

export const fmtRange = (from: string | number, to: string | number | null) =>
  to === null ? `מעל ${formatCurrencyILS(from)}` : `${formatCurrencyILS(from)} – ${formatCurrencyILS(to)}`

export const getRecognitionTone = (recognitionRate: string | number) =>
  Number(recognitionRate) < 100 ? semanticMonoToneClasses.warning : ''

export const buildCreditRows = (detail: AnnualReportFull, taxYear: number): CreditRow[] => {
  const cpv = getCreditPointValue(taxYear)
  const tc = detail.tax_calculation
  const creditPoints = Number(tc?.credit_points ?? 0)
  const pensionContribution = Number(detail.pension_contribution ?? 0)
  const rows: CreditRow[] = [
    {
      label: 'נקודות זיכוי בסיסיות',
      description: `${creditPoints} נקודות × ${formatCurrencyILS(cpv)}`,
      amount: creditPoints * cpv,
    },
  ]

  if (pensionContribution > 0) {
    rows.push({
      label: 'הפקדות קרן השתלמות',
      description: 'ניכוי 4.5% עד השכר',
      amount: pensionContribution * PENSION_DEDUCTION_RATE,
    })
  }

  const lifeInsuranceCredit = Number(tc?.life_insurance_credit_points ?? 0) * cpv
  if (lifeInsuranceCredit > 0) {
    rows.push({
      label: 'ביטוח חיים / פנסיה',
      description: 'זיכוי 25% עד ₪12,060',
      amount: lifeInsuranceCredit,
    })
  }

  const tuitionCredit = Number(tc?.tuition_credit_points ?? 0) * cpv
  if (tuitionCredit > 0) {
    rows.push({
      label: 'שכר לימוד (ילדים)',
      description: `${formatCurrencyILS(cpv)}/שנה`,
      amount: tuitionCredit,
    })
  }

  const otherCredits = Number(detail.other_credits ?? 0)
  if (otherCredits > 0) {
    rows.push({
      label: 'זיכויים אחרים',
      description: 'זיכויים נוספים',
      amount: otherCredits,
    })
  }

  return rows
}

export const sumCreditRows = (rows: CreditRow[]) => rows.reduce((sum, row) => sum + row.amount, 0)
