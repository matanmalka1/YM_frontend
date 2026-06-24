import { AlertTriangle, Edit, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RowActionItem, RowActionsMenu, statusColumn, type Column } from '@/components/ui/table'
import { formatClientOfficeId, formatDate, formatPercent, formatShekelAmount } from '@/utils/utils'
import type { AdvancePaymentOverviewRow } from '../../api/contracts'
import { ADVANCE_PAYMENT_STATUS_VARIANTS, getAdvancePaymentStatusLabel } from '../../constants'
import { getAdvancePaymentMonthLabel } from '../../utils/advancePaymentComponentUtils'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentBatchColumnOpts {
  onRowClick: (row: AdvancePaymentOverviewRow) => void
  onNavigateToClient: (clientRecordId: number) => void
}

export const buildAdvancePaymentBatchColumns = ({
  onRowClick,
  onNavigateToClient,
}: AdvancePaymentBatchColumnOpts): Column<AdvancePaymentOverviewRow>[] => [
  {
    key: 'office_client_number',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.officeNumberHeader,
    align: 'right',
    className: 'w-16 tabular-nums text-gray-400',
    headerClassName: 'w-16',
    render: (row) => formatClientOfficeId(row.office_client_number),
  },
  {
    key: 'business_name',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.clientNameHeader,
    align: 'right',
    wrap: true,
    className: 'w-48',
    headerClassName: 'w-48',
    render: (row) => (
      <>
        <Link
          to={`/clients/${row.client_record_id}/advance-payments`}
          className="block text-sm font-medium leading-snug text-gray-900 hover:text-info-600 hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {row.business_name}
        </Link>
        {row.missing_turnover && (
          <span className="mt-0.5 inline-flex items-center gap-1 rounded border border-warning-200 bg-warning-50 px-1.5 py-0.5 text-xs font-semibold text-warning-700">
            <AlertTriangle className="h-2.5 w-2.5" />
            {ADVANCED_PAYMENTS_MESSAGES.batchColumns.missingTurnoverBadge}
          </span>
        )}
      </>
    ),
  },
  {
    key: 'period',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.periodHeader,
    align: 'right',
    className: 'w-28 text-gray-600',
    headerClassName: 'w-28',
    render: (row) =>
      `${getAdvancePaymentMonthLabel(row.period, row.period_months_count)} ${row.period.substring(0, 4)}`,
  },
  {
    key: 'due_date',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.dueDateHeader,
    align: 'right',
    className: 'w-24 tabular-nums',
    headerClassName: 'w-24',
    render: (row) => {
      const isOverdue = row.timing_status === 'overdue'
      const dueDate = row.due_date_effective ?? row.due_date
      return (
        <span className={isOverdue ? 'font-medium text-negative-600' : 'text-gray-500'}>{formatDate(dueDate)}</span>
      )
    },
  },
  {
    key: 'turnover',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.turnoverHeader,
    dir: 'ltr',
    className: 'w-24 tabular-nums',
    headerClassName: 'w-24',
    render: (row) =>
      row.turnover_amount ? (
        <span className="text-gray-700">{formatShekelAmount(row.turnover_amount)}</span>
      ) : row.live_turnover ? (
        <span className="italic text-gray-400">{formatShekelAmount(row.live_turnover)}</span>
      ) : (
        <span className="text-gray-500">—</span>
      ),
  },
  {
    key: 'expected_amount',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.expectedHeader,
    dir: 'ltr',
    className: 'w-20 font-semibold tabular-nums text-gray-800',
    headerClassName: 'w-20',
    render: (row) => formatShekelAmount(row.expected_amount),
  },
  {
    key: 'paid_amount',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.paidHeader,
    dir: 'ltr',
    className: 'w-20 tabular-nums text-gray-600',
    headerClassName: 'w-20',
    render: (row) => formatShekelAmount(row.paid_amount),
  },
  {
    key: 'delta',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.balanceHeader,
    dir: 'ltr',
    className: 'w-20 tabular-nums',
    headerClassName: 'w-20',
    render: (row) =>
      row.delta == null ? (
        <span className="text-gray-500">—</span>
      ) : Number(row.delta) > 0 ? (
        <span className="font-semibold text-negative-600">{formatShekelAmount(row.delta)}</span>
      ) : (
        <span className="text-gray-500">{formatShekelAmount(row.delta)}</span>
      ),
  },
  {
    key: 'advance_rate',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.advanceRateHeader,
    dir: 'ltr',
    className: 'w-20 tabular-nums text-gray-600',
    headerClassName: 'w-20',
    render: (row) =>
      row.advance_rate != null ? (
        formatPercent(row.advance_rate, { fractionDigits: 2 })
      ) : (
        <span className="text-gray-500">—</span>
      ),
  },
  statusColumn({
    key: 'status',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.statusHeader,
    className: 'w-24',
    headerClassName: 'w-24',
    getStatus: (row) => row.status,
    getLabel: getAdvancePaymentStatusLabel,
    variantMap: ADVANCE_PAYMENT_STATUS_VARIANTS,
  }),
  {
    key: 'actions',
    header: '',
    className: 'w-10',
    headerClassName: 'w-10',
    render: (row) => (
      <RowActionsMenu ariaLabel={ADVANCED_PAYMENTS_MESSAGES.batchColumns.rowActionsAriaLabel(row.id)}>
        <RowActionItem
          label={ADVANCED_PAYMENTS_MESSAGES.batchColumns.updatePaymentAction}
          icon={<Edit className="h-3.5 w-3.5" />}
          onClick={() => onRowClick(row)}
        />
        <RowActionItem
          label={ADVANCED_PAYMENTS_MESSAGES.batchColumns.goToClientAction}
          icon={<ExternalLink className="h-3.5 w-3.5" />}
          onClick={() => onNavigateToClient(row.client_record_id)}
        />
      </RowActionsMenu>
    ),
  },
]
