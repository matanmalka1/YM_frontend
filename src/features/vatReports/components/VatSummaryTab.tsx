import { AlertTriangle } from 'lucide-react'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { computeVatBreakdown } from '../utils/vatBreakdown'
import { VatOutputCard, VatInputCard } from './VatBreakdownCards'
import { VatCategoryTable } from './VatCategoryTable'
import { formatVatAmount } from '../utils/vatHelpers'
import type { VatSummaryTabProps } from '../types'

export const VatSummaryTab: React.FC<VatSummaryTabProps> = ({ workItem, invoices }) => {
  const { setSearchParams } = useSearchParamFilters()
  const data = computeVatBreakdown(invoices, workItem.total_output_vat, workItem.total_input_vat)

  return (
    <div className="space-y-4" dir="rtl">
      {workItem.is_overridden && workItem.final_vat_amount != null && (
        <div className="flex items-center justify-between rounded-xl border border-warning-300 bg-warning-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning-500" />
            <span className="text-sm font-semibold text-warning-800">סכום מע&quot;מ סופי (עוקף)</span>
          </div>
          <span className="font-mono text-3xl font-bold tabular-nums text-warning-700">
            {formatVatAmount(workItem.final_vat_amount)}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <VatOutputCard data={data} onNavigate={() => setSearchParams({ tab: 'income' })} />
        <VatInputCard data={data} onNavigate={() => setSearchParams({ tab: 'expense' })} />
      </div>

      <VatCategoryTable
        rows={data.expenseRows}
        totalExpenseNet={data.totalExpenseNet}
        totalGrossVat={data.totalGrossVat}
        totalInputVat={data.totalInputVat}
      />
    </div>
  )
}

VatSummaryTab.displayName = 'VatSummaryTab'
