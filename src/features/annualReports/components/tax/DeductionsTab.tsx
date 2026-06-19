import { useQuery } from '@tanstack/react-query'
import { MoreHorizontal, Scissors } from 'lucide-react'
import { annualReportFinancialsApi, annualReportsQK } from '../../api'
import { TaxCreditsPanel } from './TaxCreditsPanel'
import { EXPENSE_LABELS } from '../../constants/reportConstants'
import { cn, formatCurrencyILS as fmt } from '../../../../utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { CATEGORY_ICONS } from '../../constants/taxConstants'
import { getRecognitionTone } from '../../utils/taxHelpers'

interface Props {
  reportId: number
  taxYear: number
}

export const DeductionsTab: React.FC<Props> = ({ reportId, taxYear }) => {
  const { data, isLoading } = useQuery({
    queryKey: annualReportsQK.financials(reportId),
    queryFn: () => annualReportFinancialsApi.getFinancials(reportId),
  })

  if (isLoading) return <p className="py-8 text-center text-sm text-gray-400">טוען ניכויים...</p>

  const expenses = data?.expense_lines ?? []
  const totalRecognized = expenses.reduce((s, e) => s + Number(e.recognized_amount), 0)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Recognized deductions */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-negative-500" />
              <h3 className="text-sm font-semibold text-gray-800">ניכויים מוכרים</h3>
            </div>
            {expenses.length > 0 && (
              <span className={cn('text-sm font-bold', semanticMonoToneClasses.negative)}>{fmt(totalRecognized)}</span>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {expenses.length === 0 && <p className="px-5 py-8 text-center text-sm text-gray-400">אין ניכויים להצגה</p>}
            {expenses.map((e) => {
              const Icon = CATEGORY_ICONS[e.category] ?? MoreHorizontal
              return (
                <div key={e.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      <Icon className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{EXPENSE_LABELS[e.category] ?? e.category}</p>
                      {Number(e.recognition_rate) < 100 && (
                        <p className={cn('text-xs', getRecognitionTone(e.recognition_rate))}>
                          {Number(e.recognition_rate)}% מוכר
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={cn('text-sm font-semibold', semanticMonoToneClasses.negative)}>
                    {fmt(e.recognized_amount)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <TaxCreditsPanel reportId={reportId} taxYear={taxYear} />
      </div>
    </div>
  )
}

DeductionsTab.displayName = 'DeductionsTab'
