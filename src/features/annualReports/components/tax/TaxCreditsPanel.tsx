import { useQuery } from '@tanstack/react-query'
import { annualReportsApi, annualReportsQK } from '../../api'
import { formatCurrencyILS as fmt } from '@/utils/utils'
import { buildCreditRows, sumCreditRows } from '../../utils/taxHelpers'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface Props {
  reportId: number
  taxYear: number
}

export const TaxCreditsPanel: React.FC<Props> = ({ reportId, taxYear }) => {
  const { data, isLoading } = useQuery({
    queryKey: annualReportsQK.detail(reportId),
    queryFn: () => annualReportsApi.getReport(reportId),
  })

  if (isLoading) return <p className="text-sm text-gray-400">{ANNUAL_REPORTS_MESSAGES.creditsPanel.loading}</p>
  if (!data) return null

  const rows = buildCreditRows(data, taxYear)
  const total = sumCreditRows(rows)

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{ANNUAL_REPORTS_MESSAGES.creditsPanel.title}</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{r.label}</p>
              <p className="text-xs text-gray-400">{r.description}</p>
            </div>
            <span className="text-sm font-semibold text-info-700">{fmt(r.amount)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex justify-between">
        <span className="text-sm font-semibold text-gray-700">{ANNUAL_REPORTS_MESSAGES.creditsPanel.total}</span>
        <span className="text-sm font-bold text-info-800">{fmt(total)}</span>
      </div>
    </div>
  )
}
