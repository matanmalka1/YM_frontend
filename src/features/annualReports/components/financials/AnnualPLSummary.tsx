import { useQuery } from '@tanstack/react-query'
import { annualReportFinancialsApi } from '../../api'
import { annualReportTaxApi } from '../../api'
import { annualReportsQK } from '../../api'
import { DrawerSection } from '../../../../components/ui/overlays/DetailDrawer'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { formatCurrencyILS as fmt, formatPercent } from '@/utils/utils'
import { FINANCIAL_MESSAGES } from '../../constants/financialConstants'
import { getProfitSummary, toProgressWidth } from '../../utils/financialHelpers'
import { MultiYearPLChart } from './MultiYearPLChart'

interface Props {
  reportId: number
  clientId: number
}

interface WaterfallRowProps {
  label: string
  value: number
  isSubtract?: boolean
  isResult?: boolean
  highlight?: boolean
}

const WaterfallRow: React.FC<WaterfallRowProps> = ({ label, value, isSubtract, isResult, highlight }) => (
  <div
    className={`flex items-center justify-between px-3 py-2 text-sm ${
      highlight
        ? 'rounded-md bg-warning-50 font-bold text-warning-900'
        : isResult
          ? 'rounded-md bg-gray-100 font-semibold text-gray-900'
          : 'border-b border-gray-100 text-gray-700'
    }`}
  >
    <span className={isSubtract ? semanticMonoToneClasses.negative : ''}>{label}</span>
    <span className={isSubtract ? semanticMonoToneClasses.negative : highlight ? 'text-warning-700' : ''}>
      {fmt(value)}
    </span>
  </div>
)

export const AnnualPLSummary: React.FC<Props> = ({ reportId, clientId }) => {
  const financialsQ = useQuery({
    queryKey: annualReportsQK.financials(reportId),
    queryFn: () => annualReportFinancialsApi.getFinancials(reportId),
    enabled: !!reportId,
  })

  const taxQ = useQuery({
    queryKey: annualReportsQK.taxCalc(reportId),
    queryFn: () => annualReportTaxApi.getTaxCalculation(reportId),
    enabled: !!reportId,
  })

  const isLoading = financialsQ.isLoading || taxQ.isLoading
  if (isLoading) {
    return <p className="px-3 text-sm text-gray-400">{FINANCIAL_MESSAGES.loadingSummary}</p>
  }
  if (!financialsQ.data || !taxQ.data) return null

  const summary = getProfitSummary(financialsQ.data, taxQ.data)

  return (
    <DrawerSection title="סיכום רווח והפסד">
      <div className="space-y-4 py-2">
        <div className="space-y-0.5">
          <WaterfallRow label="הכנסות ברוטו" value={summary.grossIncome} />
          <WaterfallRow label="פחות: הוצאות מוכרות" value={summary.expenses} isSubtract />
          <WaterfallRow label="רווח לפני מס" value={summary.profitBeforeTax} isResult />
          <WaterfallRow label="פחות: מס הכנסה" value={summary.taxAmount} isSubtract />
          <WaterfallRow label="רווח נקי אחרי מס" value={summary.netProfitAfterTax} highlight />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>שיעור רווח גולמי</span>
            <span className="font-semibold text-gray-700">{formatPercent(summary.grossMargin, { isRatio: true })}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-warning-500 transition-all"
              style={{ width: toProgressWidth(summary.grossMargin) }}
            />
          </div>
        </div>

        {clientId ? <MultiYearPLChart clientId={clientId} currentReportId={reportId} /> : null}
      </div>
    </DrawerSection>
  )
}
