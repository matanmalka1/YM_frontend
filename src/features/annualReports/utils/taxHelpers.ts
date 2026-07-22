import { formatCurrencyILS, formatPercent } from '@/utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import type { AnnualReportFull } from '../api'

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
  liability > 0 ? { tax_due: String(liability), refund_due: null } : { tax_due: null, refund_due: String(Math.abs(liability)) }

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
  Number(recognitionRate) < 1 ? semanticMonoToneClasses.warning : ''
