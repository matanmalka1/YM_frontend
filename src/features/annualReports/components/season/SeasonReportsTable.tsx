import { GLOBAL_UI_MESSAGES } from '@/messages'
import { DataTable, dateColumn, monoColumn, textColumn, type Column } from '../../../../components/ui/table'
import { Badge } from '../../../../components/ui/primitives/Badge'
import type { AnnualReportListItem } from '../../api'
import { getStatusLabel, getStatusVariant, getClientTypeLabel } from '../../constants/display'
import { getDeadlineTypeLabel } from '../../constants/sharedConstants'
import { formatClientOfficeId, formatDate } from '../../../../utils/utils'
import { AlertTriangle, Clock } from 'lucide-react'
import { cn } from '../../../../utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface SeasonReportsTableProps {
  reports: AnnualReportListItem[]
  isLoading?: boolean
  taxYear?: number
  onSelect?: (report: AnnualReportListItem) => void
}

const DeadlineCell: React.FC<{ report: AnnualReportListItem }> = ({ report }) => {
  const days = report.days_until_deadline
  const overdue = report.is_overdue

  return (
    <div className="flex flex-col gap-0.5">
      <span className={cn('tabular-nums', overdue ? semanticMonoToneClasses.negative : 'text-gray-600')}>
        {formatDate(report.filing_deadline)}
      </span>
      {days !== null && (
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs',
            days < 0 ? 'text-negative-500' : days <= 14 ? 'text-warning-500' : 'text-gray-500',
          )}
        >
          {days < 0 ? (
            <>
              <AlertTriangle className="h-3 w-3" />
              {ANNUAL_REPORTS_MESSAGES.season.overdueDays(Math.abs(days))}
            </>
          ) : (
            <>
              <Clock className="h-3 w-3" />
              {ANNUAL_REPORTS_MESSAGES.season.daysRemaining(days)}
            </>
          )}
        </span>
      )}
    </div>
  )
}

const columns: Column<AnnualReportListItem>[] = [
  {
    key: 'office_client_number',
    header: ANNUAL_REPORTS_MESSAGES.season.officeNumberHeader,
    kind: 'mono',
    dir: 'ltr',
    render: (r) => formatClientOfficeId(r.office_client_number),
  },
  textColumn({
    key: 'client_name',
    header: GLOBAL_UI_MESSAGES.common.clientName,
    tone: 'strong',
    getValue: (r) => r.client_name ?? ANNUAL_REPORTS_MESSAGES.season.clientFallbackName(r.client_record_id),
  }),
  monoColumn({
    key: 'client_id_number',
    header: ANNUAL_REPORTS_MESSAGES.season.idNumberHeader,
    getValue: (r) => r.client_id_number,
  }),
  {
    key: 'client_type',
    header: ANNUAL_REPORTS_MESSAGES.season.typeFormHeader,
    render: (r) => (
      <div className="flex flex-col gap-0.5">
        <span>{getClientTypeLabel(r.client_type)}</span>
        <Badge variant="neutral" className="w-fit font-mono">
          {r.form_type}
        </Badge>
      </div>
    ),
  },
  {
    key: 'status',
    header: GLOBAL_UI_MESSAGES.common.status,
    kind: 'status',
    render: (r) => <Badge variant={getStatusVariant(r.status)}>{getStatusLabel(r.status)}</Badge>,
  },
  {
    key: 'filing_deadline',
    header: ANNUAL_REPORTS_MESSAGES.season.filingDeadlineHeader,
    render: (r) => <DeadlineCell report={r} />,
  },
  {
    key: 'deadline_type',
    header: ANNUAL_REPORTS_MESSAGES.season.deadlineTypeHeader,
    render: (r) => getDeadlineTypeLabel(r.deadline_type),
  },
  dateColumn({
    key: 'submitted_at',
    header: ANNUAL_REPORTS_MESSAGES.season.submittedAtHeader,
    getValue: (r) => r.submitted_at,
  }),
]

export const SeasonReportsTable: React.FC<SeasonReportsTableProps> = ({ reports, isLoading, taxYear, onSelect }) => (
  <DataTable
    data={reports}
    columns={columns}
    getRowKey={(r) => r.id}
    isLoading={isLoading}
    onRowClick={onSelect}
    emptyMessage={
      taxYear ? ANNUAL_REPORTS_MESSAGES.season.noReportsForYear(taxYear) : ANNUAL_REPORTS_MESSAGES.season.noReportsThisYear
    }
    getRowVariant={(r) => {
      return r.is_overdue ? 'dangerSoft' : undefined
    }}
  />
)
