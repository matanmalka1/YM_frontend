import { useQuery } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { annualReportsApi, annualReportsQK, type AnnualReportListItem } from '../../api'
import { DataTable } from '../../../../components/ui/table/DataTable'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table'
import { getStatusLabel, getStatusVariant } from '../../api'
import { formatCurrencyILS as fmt, formatDate } from '../../../../utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { sortReportsByTaxYearDesc } from '../../utils/panelHelpers'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { ANNUAL_REPORTS_COMPLETE_LIST_PARAMS } from '../../constants/reportConstants'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface Props {
  clientId: number
  currentReportId: number
  onSelect?: (reportId: number) => void
}

export const ReportHistoryTable: React.FC<Props> = ({ clientId, currentReportId, onSelect }) => {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: annualReportsQK.forClient(clientId),
    queryFn: () => annualReportsApi.listClientReports(clientId, ANNUAL_REPORTS_COMPLETE_LIST_PARAMS),
    staleTime: QUERY_STALE_TIME.default,
    enabled: !!clientId,
  })

  const sorted = sortReportsByTaxYearDesc(reports)

  return (
    <DataTable<AnnualReportListItem>
      data={sorted}
      isLoading={isLoading}
      getRowKey={(r) => r.id}
      emptyMessage={ANNUAL_REPORTS_MESSAGES.reportHistoryTable.emptyMessage}
      rowClassName={(r) => (r.id === currentReportId ? 'bg-primary-50' : '')}
      columns={[
        {
          key: 'tax_year',
          header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.yearHeader,
          render: (r) => <span className="font-semibold text-gray-900">{r.tax_year}</span>,
        },
        {
          key: 'assessment_amount',
          header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.assessmentHeader,
          render: (r) => <span className="text-gray-700">{fmt(r.assessment_amount)}</span>,
        },
        {
          key: 'refund_due',
          header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.refundDueHeader,
          render: (r) => <span className={semanticMonoToneClasses.positive}>{fmt(r.refund_due)}</span>,
        },
        {
          key: 'tax_due',
          header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.taxDueHeader,
          render: (r) => <span className={semanticMonoToneClasses.negative}>{fmt(r.tax_due)}</span>,
        },
        {
          key: 'submitted_at',
          header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.submittedAtHeader,
          render: (r) => <span className="text-gray-500 text-xs">{formatDate(r.submitted_at) ?? '—'}</span>,
        },
        {
          key: 'status',
          header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.statusHeader,
          render: (r) => <Badge variant={getStatusVariant(r.status)}>{getStatusLabel(r.status)}</Badge>,
        },
        {
          key: 'actions',
          header: '',
          render: (r) => (
            <RowActionsMenu ariaLabel={ANNUAL_REPORTS_MESSAGES.reportHistoryTable.rowActionsAriaLabel(r.id)}>
              <RowActionItem label={ANNUAL_REPORTS_MESSAGES.reportHistoryTable.view} onClick={() => onSelect?.(r.id)} icon={<Eye className="h-4 w-4" />} />
            </RowActionsMenu>
          ),
        },
      ]}
    />
  )
}
