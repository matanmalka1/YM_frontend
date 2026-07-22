import { useQuery } from '@tanstack/react-query'
import { annualReportsApi, annualReportsQK } from '../../api'
import { formatCurrencyILS } from '@/utils/utils'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface Props {
  reportId: number
}

export const TaxCreditsPanel: React.FC<Props> = ({ reportId }) => {
  const { data, isLoading } = useQuery({
    queryKey: annualReportsQK.detail(reportId),
    queryFn: () => annualReportsApi.getReport(reportId),
  })

  if (isLoading) return <p className="text-sm text-gray-400">{ANNUAL_REPORTS_MESSAGES.creditsPanel.loading}</p>
  if (!data) return null

  const calculation = data.tax_calculation
  const rows = [
    {
      key: 'credit-points',
      label: ANNUAL_REPORTS_MESSAGES.creditsPanel.creditPoints,
      description: ANNUAL_REPORTS_MESSAGES.creditsPanel.creditPointsDescription(calculation?.credit_points ?? '0'),
      amount: calculation?.credit_points_value ?? '0',
    },
    {
      key: 'donations',
      label: ANNUAL_REPORTS_MESSAGES.creditsPanel.donations,
      description: ANNUAL_REPORTS_MESSAGES.creditsPanel.donationsDescription,
      amount: calculation?.donation_credit ?? '0',
    },
    {
      key: 'other',
      label: ANNUAL_REPORTS_MESSAGES.creditsPanel.other,
      description: ANNUAL_REPORTS_MESSAGES.creditsPanel.otherDescription,
      amount: data.other_credits ?? '0',
    },
  ].filter((row) => Number(row.amount) > 0)
  const total = rows.reduce((sum, row) => sum + Number(row.amount), 0)

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{ANNUAL_REPORTS_MESSAGES.creditsPanel.title}</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{r.label}</p>
              <p className="text-xs text-gray-400">{r.description}</p>
            </div>
            <span className="text-sm font-semibold text-info-700">{formatCurrencyILS(r.amount)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex justify-between">
        <span className="text-sm font-semibold text-gray-700">{ANNUAL_REPORTS_MESSAGES.creditsPanel.total}</span>
        <span className="text-sm font-bold text-info-800">{formatCurrencyILS(total)}</span>
      </div>
    </div>
  )
}
