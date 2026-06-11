import { useQuery } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { annualReportsApi, annualReportsQK, type AnnualReportListItem } from '../../api'
import { DataTable } from '../../../../components/ui/table/DataTable'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table'
import { getStatusLabel, getStatusVariant } from '../../api'
import { formatCurrencyILS as fmt, formatDate } from '../../../../utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { sortReportsByTaxYearDesc } from './helpers'
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
    <DataTable<AnnualReportListItem>
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
          key: 'assessment_amount',
          header: 'שומה',
          render: (r) => <span className="text-gray-700">{fmt(r.assessment_amount)}</span>,
        },
        {
          key: 'refund_due',
          header: 'החזר מס',
          render: (r) => <span className={semanticMonoToneClasses.positive}>{fmt(r.refund_due)}</span>,
        },
        {
          key: 'tax_due',
          header: 'חבות מס',
          render: (r) => <span className={semanticMonoToneClasses.negative}>{fmt(r.tax_due)}</span>,
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
