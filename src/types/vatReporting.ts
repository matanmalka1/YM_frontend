export type VatReportingFrequency = 'monthly' | 'bimonthly' | 'exempt'

export const VAT_REPORTING_FREQUENCIES = ['monthly', 'bimonthly', 'exempt'] as const satisfies readonly VatReportingFrequency[]

export const VAT_REPORTING_FREQUENCY_LABELS: Record<VatReportingFrequency, string> = {
  monthly: 'חודשי',
  bimonthly: 'דו-חודשי',
  exempt: 'פטור',
}
