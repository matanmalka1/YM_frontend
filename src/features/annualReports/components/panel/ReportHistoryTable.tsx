import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { annualReportsApi, annualReportsQK, type AnnualReportListItem } from '../../api'
import { actionsColumn, DataTable, dateColumn, moneyColumn, RowActionItem, RowActionsMenu } from '@/components/ui/table'
import { Badge } from '@/components/ui/primitives/Badge'
import { getStatusLabel, getStatusVariant } from '../../constants/display'
import { formatCurrencyILS } from '@/utils/utils'
import { sortReportsByTaxYearDesc } from '../../utils/panelHelpers'
import { ANNUAL_REPORTS_COMPLETE_LIST_PARAMS } from '../../constants/reportConstants'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface Props {
  clientId: number
  currentReportId?: number
  onSelect?: (reportId: number) => void
}

export const ReportHistoryTable: React.FC<Props> = ({ clientId, currentReportId, onSelect }) => {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: annualReportsQK.forClient(clientId),
    queryFn: () => annualReportsApi.listClientReports(clientId, ANNUAL_REPORTS_COMPLETE_LIST_PARAMS),
    enabled: !!clientId,
  })

  const sortedReports = useMemo(() => sortReportsByTaxYearDesc(reports), [reports])

  const columns = useMemo(
    () => [
      {
        key: 'tax_year',
        header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.yearHeader,
        kind: 'number' as const,
        tone: 'strong' as const,
        render: (r: AnnualReportListItem) => r.tax_year,
      },
      moneyColumn<AnnualReportListItem>({
        key: 'assessment_amount',
        header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.assessmentHeader,
        getValue: (r) => (r.assessment_amount == null ? null : formatCurrencyILS(r.assessment_amount)),
      }),
      moneyColumn<AnnualReportListItem>({
        key: 'refund_due',
        header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.refundDueHeader,
        tone: 'success',
        getValue: (r) => (r.refund_due == null ? null : formatCurrencyILS(r.refund_due)),
      }),
      moneyColumn<AnnualReportListItem>({
        key: 'tax_due',
        header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.taxDueHeader,
        tone: 'danger',
        getValue: (r) => (r.tax_due == null ? null : formatCurrencyILS(r.tax_due)),
      }),
      dateColumn<AnnualReportListItem>({
        key: 'submitted_at',
        header: ANNUAL_REPORTS_MESSAGES.reportHistoryTable.submittedAtHeader,
        getValue: (r) => r.submitted_at,
      }),
      {
        key: 'status',
        header: GLOBAL_UI_MESSAGES.common.status,
        kind: 'status' as const,
        render: (r: AnnualReportListItem) => <Badge variant={getStatusVariant(r.status)}>{getStatusLabel(r.status)}</Badge>,
      },
      actionsColumn<AnnualReportListItem>({
        key: 'actions',
        header: '',
        render: (r) => {
          const isCurrent = r.id === currentReportId
          return (
            <RowActionsMenu ariaLabel={ANNUAL_REPORTS_MESSAGES.reportHistoryTable.rowActionsAriaLabel(r.id)}>
              <RowActionItem
                label={
                  isCurrent
                    ? ANNUAL_REPORTS_MESSAGES.reportHistoryTable.currentReportActionLabel
                    : GLOBAL_UI_MESSAGES.actions.view
                }
                onClick={() => onSelect?.(r.id)}
                icon={<Eye className="h-4 w-4" />}
                disabled={isCurrent}
              />
            </RowActionsMenu>
          )
        },
      }),
    ],
    [currentReportId, onSelect],
  )

  return (
    <DataTable<AnnualReportListItem>
      data={sortedReports}
      isLoading={isLoading}
      getRowKey={(r) => r.id}
      emptyMessage={ANNUAL_REPORTS_MESSAGES.reportHistoryTable.emptyMessage}
      getRowVariant={(r) => (r.id === currentReportId ? 'primarySoft' : undefined)}
      columns={columns}
    />
  )
}
