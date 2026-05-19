import { useQuery } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { annualReportsApi, annualReportsQK, type AnnualReportFull } from '../../api'
import { DataTable } from '../../../../components/ui/table/DataTable'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table'
import { getStatusLabel, getStatusVariant } from '../../api'
import { formatCurrencyILS as fmt, formatDate } from '../../../../utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { getFinalBalanceText, sortReportsByTaxYearDesc } from './helpers'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

interface Props {
  clientId: number
  currentReportId: number
  onSelect?: (reportId: number) => void
}

export const ReportHistoryTable: React.FC<Props> = ({ clientId, currentReportId, onSelect }) => {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: annualReportsQK.forClient(clientId),
    queryFn: () => annualReportsApi.listClientReports(clientId),
    staleTime: QUERY_STALE_TIME.default,
    enabled: !!clientId,
  })

  const sorted = sortReportsByTaxYearDesc(reports)

  return (
    <DataTable<AnnualReportFull>
      data={sorted}
      isLoading={isLoading}
      getRowKey={(r) => r.id}
      emptyMessage="אין היסטוריית דוחות"
      rowClassName={(r) => (r.id === currentReportId ? 'bg-primary-50' : '')}
      columns={[
        {
          key: 'tax_year',
          header: 'שנה',
          render: (r) => <span className="font-semibold text-gray-900">{r.tax_year}</span>,
        },
        {
          key: 'total_income',
          header: 'הכנסות',
          render: (r) => <span className="text-gray-700">{fmt(r.total_income)}</span>,
        },
        {
          key: 'total_expenses',
          header: 'הוצאות',
          render: (r) => <span className="text-gray-700">{fmt(r.total_expenses)}</span>,
        },
        {
          key: 'profit',
          header: 'רווח נקי',
          render: (r) => (
            <span
              className={
                r.profit != null && Number(r.profit) >= 0
                  ? semanticMonoToneClasses.positive
                  : semanticMonoToneClasses.negative
              }
            >
              {fmt(r.profit)}
            </span>
          ),
        },
        {
          key: 'tax_due',
          header: 'חבות מס',
          render: (r) => <span className={semanticMonoToneClasses.negative}>{fmt(r.tax_due)}</span>,
        },
        {
          key: 'final_balance',
          header: 'יתרה/החזר',
          render: (r) => {
            if (r.final_balance == null) return <span className="text-gray-400">—</span>
            return (
              <span
                className={
                  Number(r.final_balance) > 0 ? semanticMonoToneClasses.negative : semanticMonoToneClasses.positive
                }
              >
                {getFinalBalanceText(r.final_balance)}
              </span>
            )
          },
        },
        {
          key: 'submitted_at',
          header: 'תאריך הגשה',
          render: (r) => <span className="text-gray-500 text-xs">{formatDate(r.submitted_at) ?? '—'}</span>,
        },
        {
          key: 'status',
          header: 'סטטוס',
          render: (r) => <Badge variant={getStatusVariant(r.status)}>{getStatusLabel(r.status)}</Badge>,
        },
        {
          key: 'actions',
          header: '',
          render: (r) => (
            <RowActionsMenu ariaLabel={`פעולות לדוח ${r.id}`}>
              <RowActionItem label="צפה" onClick={() => onSelect?.(r.id)} icon={<Eye className="h-4 w-4" />} />
            </RowActionsMenu>
          ),
        },
      ]}
    />
  )
}
