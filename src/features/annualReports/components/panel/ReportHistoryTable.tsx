import { useQuery } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { annualReportsApi, annualReportsQK, type AnnualReportListItem } from '../../api'
import { actionsColumn, DataTable, dateColumn, moneyColumn, RowActionItem, RowActionsMenu } from '@/components/ui/table'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { getStatusLabel, getStatusVariant } from '../../api'
import { formatCurrencyILS as fmt } from '../../../../utils/utils'
import { sortReportsByTaxYearDesc } from '../../utils/panelHelpers'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { ANNUAL_REPORTS_COMPLETE_LIST_PARAMS } from '../../constants/reportConstants'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

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
      getRowVariant={(r) => (r.id === currentReportId ? 'primarySoft' : undefined)}
      columns={[
        {
          key: 'tax_year',
          header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.yearHeader,
          kind: 'number',
          tone: 'strong',
          render: (r) => r.tax_year,
        },
        moneyColumn({
          key: 'assessment_amount',
          header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.assessmentHeader,
          getValue: (r) => fmt(r.assessment_amount),
        }),
        moneyColumn({
          key: 'refund_due',
          header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.refundDueHeader,
          tone: 'success',
          getValue: (r) => fmt(r.refund_due),
        }),
        moneyColumn({
          key: 'tax_due',
          header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.taxDueHeader,
          tone: 'danger',
          getValue: (r) => fmt(r.tax_due),
        }),
        dateColumn({
          key: 'submitted_at',
          header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.submittedAtHeader,
          getValue: (r) => r.submitted_at,
        }),
        {
          key: 'status',
          header: GLOBAL_UI_MESSAGES.common.status,
          kind: 'status',
          render: (r) => <Badge variant={getStatusVariant(r.status)}>{getStatusLabel(r.status)}</Badge>,
        },
        actionsColumn({
          key: 'actions',
          header: '',
          render: (r) => (
            <RowActionsMenu ariaLabel={ANNUAL_REPORTS_MESSAGES.reportHistoryTable.rowActionsAriaLabel(r.id)}>
              <RowActionItem
                label={GLOBAL_UI_MESSAGES.actions.view}
                onClick={() => onSelect?.(r.id)}
                icon={<Eye className="h-4 w-4" />}
              />
            </RowActionsMenu>
          ),
        }),
      ]}
    />
  )
}
