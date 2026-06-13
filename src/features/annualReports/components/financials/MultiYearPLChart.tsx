import { useQueries, useQuery } from '@tanstack/react-query'
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { annualReportFinancialsApi, annualReportsApi, annualReportsQK, annualReportTaxApi } from '../../api'
import { formatCurrencyILS as fmt } from '../../../../utils/utils'
import { CHART_LINES, CHART_MARGIN, TREND_REPORT_LIMIT } from './financialConstants'
import { buildTrendChartRows } from './financialHelpers'
import { ANNUAL_REPORTS_COMPLETE_LIST_PARAMS } from '../../report.constants'

interface MultiYearPLChartProps {
  clientId: number
  currentReportId: number
}

export const MultiYearPLChart: React.FC<MultiYearPLChartProps> = ({ clientId, currentReportId }) => {
  const reportsQ = useQuery({
    queryKey: annualReportsQK.forClient(clientId),
    queryFn: () => annualReportsApi.listClientReports(clientId, ANNUAL_REPORTS_COMPLETE_LIST_PARAMS),
  })

  const reports = [...(reportsQ.data ?? [])].sort((a, b) => a.tax_year - b.tax_year).slice(-TREND_REPORT_LIMIT)

  const queryInputs = reports.map((report) => ({
    id: report.id,
    year: report.tax_year,
    isCurrent: report.id === currentReportId,
  }))

  const financialResults = useQueries({
    queries: queryInputs.map((report) => ({
      queryKey: annualReportsQK.financials(report.id),
      queryFn: () => annualReportFinancialsApi.getFinancials(report.id),
      enabled: queryInputs.length > 0,
    })),
  })

  const taxResults = useQueries({
    queries: queryInputs.map((report) => ({
      queryKey: annualReportsQK.taxCalc(report.id),
      queryFn: () => annualReportTaxApi.getTaxCalculation(report.id),
      enabled: queryInputs.length > 0,
    })),
  })

  const chartData = buildTrendChartRows(
    queryInputs,
    financialResults.map((result) => result.data),
    taxResults.map((result) => result.data),
  )

  if (chartData.length < 2) return null

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">מגמה רב-שנתית</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={CHART_MARGIN}>
          <XAxis dataKey="שנה" tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={(value) => `₪${(Number(value) / 1000).toFixed(0)}K`}
            tick={{ fontSize: 10 }}
            width={52}
          />
          <Tooltip formatter={(value) => fmt(Number(value))} labelFormatter={(label) => `שנת מס ${label}`} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {CHART_LINES.map((line) => (
            <Line key={line.dataKey} type="monotone" dot={false} {...line} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
