import { lazy, Suspense } from 'react'
import { DrawerSection } from '../../../../components/ui/overlays/DrawerPrimitives'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { ProgressBar } from '@/components/ui/primitives/ProgressBar'
import { formatCurrencyILS as fmt, formatPercent } from '@/utils/utils'
import { FINANCIAL_MESSAGES } from '../../constants/financialConstants'
import { useAnnualPLSummary } from '../../hooks/useAnnualPLSummary'
import { toProgressValue } from '../../utils/financialHelpers'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

// Lazy-loaded: pulls in recharts (heavy) only when the summary drawer renders.
const MultiYearPLChart = lazy(() => import('./MultiYearPLChart').then((m) => ({ default: m.MultiYearPLChart })))

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
  const { isLoading, summary } = useAnnualPLSummary(reportId)

  if (isLoading) {
    return <p className="px-3 text-sm text-gray-400">{FINANCIAL_MESSAGES.loadingSummary}</p>
  }
  if (!summary) return null

  return (
    <DrawerSection title={ANNUAL_REPORTS_MESSAGES.plSummary.title}>
      <div className="space-y-4 py-2">
        <div className="space-y-0.5">
          <WaterfallRow label={ANNUAL_REPORTS_MESSAGES.plSummary.grossIncome} value={summary.grossIncome} />
          <WaterfallRow
            label={ANNUAL_REPORTS_MESSAGES.plSummary.expensesDeduction}
            value={summary.expenses}
            isSubtract
          />
          <WaterfallRow
            label={ANNUAL_REPORTS_MESSAGES.plSummary.profitBeforeTax}
            value={summary.profitBeforeTax}
            isResult
          />
          <WaterfallRow label={ANNUAL_REPORTS_MESSAGES.plSummary.taxDeduction} value={summary.taxAmount} isSubtract />
          <WaterfallRow
            label={ANNUAL_REPORTS_MESSAGES.plSummary.netProfitAfterTax}
            value={summary.netProfitAfterTax}
            highlight
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>{ANNUAL_REPORTS_MESSAGES.plSummary.grossMarginLabel}</span>
            <span className="font-semibold text-gray-700">{formatPercent(summary.grossMargin, { isRatio: true })}</span>
          </div>
          <ProgressBar value={toProgressValue(summary.grossMargin)} tone="warning" />
        </div>

        {clientId ? (
          <Suspense fallback={null}>
            <MultiYearPLChart clientId={clientId} currentReportId={reportId} />
          </Suspense>
        ) : null}
      </div>
    </DrawerSection>
  )
}
