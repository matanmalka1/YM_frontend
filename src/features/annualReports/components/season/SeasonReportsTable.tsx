import { DataTable, type Column } from '../../../../components/ui/table/DataTable'
import { Badge } from '../../../../components/ui/primitives/Badge'
import type { AnnualReportListItem } from '../../api'
import { getStatusLabel, getStatusVariant, getClientTypeLabel } from '../../api'

const FILING_DEADLINE_TYPE_LABELS: Record<string, string> = {
  standard: 'רגיל',
  extended: 'מוארך',
  custom: 'מותאם אישית',
}

const getDeadlineTypeLabel = (type: string | null | undefined): string =>
  (type && FILING_DEADLINE_TYPE_LABELS[type]) ?? 'סוג מועד לא ידוע'
import { formatClientOfficeId, formatDate } from '../../../../utils/utils'
import { AlertTriangle, Clock } from 'lucide-react'
import { cn } from '../../../../utils/utils'
import { TERMINAL_STATUSES, daysUntil } from '../../utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'

interface SeasonReportsTableProps {
  reports: AnnualReportListItem[]
  isLoading?: boolean
  taxYear?: number
  onSelect?: (report: AnnualReportListItem) => void
}

const DeadlineCell: React.FC<{ report: AnnualReportListItem }> = ({ report }) => {
  const days = daysUntil(report.filing_deadline)
  const isTerminal = TERMINAL_STATUSES.has(report.status)
  const overdue = days !== null && days < 0 && !isTerminal

  return (
    <div className="flex flex-col gap-0.5">
      <span className={cn('text-sm', overdue && semanticMonoToneClasses.negative)}>
        {formatDate(report.filing_deadline)}
      </span>
      {days !== null && !isTerminal && (
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs',
            days < 0 ? 'text-negative-500' : days <= 14 ? 'text-warning-500' : 'text-gray-400',
          )}
        >
          {days < 0 ? (
            <>
              <AlertTriangle className="h-3 w-3" />
              באיחור {Math.abs(days)} ימים
            </>
          ) : (
            <>
              <Clock className="h-3 w-3" />
              {days} ימים נותרו
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
    header: "מס' לקוח",
    render: (r) => (
      <span className="font-mono text-sm text-gray-500 tabular-nums">
        {formatClientOfficeId(r.office_client_number)}
      </span>
    ),
  },
  {
    key: 'client_name',
    header: 'לקוח',
    render: (r) => (
      <span className="text-sm font-medium text-gray-900">{r.client_name ?? `לקוח #${r.client_record_id}`}</span>
    ),
  },
  {
    key: 'client_id_number',
    header: 'ת.ז / ח.פ',
    render: (r) => <span className="font-mono text-sm text-gray-500 tabular-nums">{r.client_id_number ?? '—'}</span>,
  },
  {
    key: 'client_type',
    header: 'סוג / טופס',
    render: (r) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-gray-700">{getClientTypeLabel(r.client_type)}</span>
        <Badge variant="neutral" className="w-fit font-mono">
          {r.form_type}
        </Badge>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'סטטוס',
    render: (r) => <Badge variant={getStatusVariant(r.status)}>{getStatusLabel(r.status)}</Badge>,
  },
  {
    key: 'filing_deadline',
    header: 'מועד הגשה',
    render: (r) => <DeadlineCell report={r} />,
  },
  {
    key: 'deadline_type',
    header: 'סוג מועד',
    render: (r) => <span className="text-sm text-gray-500">{getDeadlineTypeLabel(r.deadline_type)}</span>,
  },
  {
    key: 'submitted_at',
    header: 'הוגש ב',
    render: (r) => <span className="text-sm text-gray-500 tabular-nums">{formatDate(r.submitted_at)}</span>,
  },
]

export const SeasonReportsTable: React.FC<SeasonReportsTableProps> = ({ reports, isLoading, taxYear, onSelect }) => (
  <DataTable
    data={reports}
    columns={columns}
    getRowKey={(r) => r.id}
    isLoading={isLoading}
    onRowClick={onSelect}
    emptyMessage={taxYear ? `עדיין אין דוחות שנתיים לשנת המס ${taxYear}` : 'אין דוחות לשנה זו'}
    rowClassName={(r) => {
      const days = daysUntil(r.filing_deadline)
      const overdue = days !== null && days < 0 && !TERMINAL_STATUSES.has(r.status)
      return cn(overdue && 'bg-negative-50/40')
    }}
  />
)
