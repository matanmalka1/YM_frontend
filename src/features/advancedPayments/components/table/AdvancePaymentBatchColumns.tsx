import { GLOBAL_UI_MESSAGES } from '@/messages'
import { AlertTriangle, Edit, ExternalLink } from 'lucide-react'
import {
  actionsColumn,
  EmptyCell,
  moneyColumn,
  monoColumn,
  numberColumn,
  RowActionItem,
  RowActionsMenu,
  statusColumn,
  textColumn,
  type Column,
} from '@/components/ui/table'
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
  monoColumn({
    key: 'office_client_number',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.officeNumberHeader,
    getValue: (row) => formatClientOfficeId(row.office_client_number),
  }),
  {
    key: 'client_name',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.clientNameHeader,
    wrap: true,
    render: (row) => (
      <>
        <span className="block font-semibold leading-snug text-gray-900">{row.client_name}</span>
        {row.missing_turnover && (
          <span className="mt-0.5 inline-flex items-center gap-1 rounded border border-warning-200 bg-warning-50 px-1.5 py-0.5 text-xs font-semibold text-warning-700">
            <AlertTriangle className="h-2.5 w-2.5" />
            {ADVANCED_PAYMENTS_MESSAGES.batchColumns.missingTurnoverBadge}
          </span>
        )}
      </>
    ),
  },
  textColumn({
    key: 'period',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.periodHeader,
    getValue: (row) =>
      `${getAdvancePaymentMonthLabel(row.period, row.period_months_count)} ${row.period.substring(0, 4)}`,
  }),
  {
    key: 'due_date',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.dueDateHeader,
    kind: 'date',
    render: (row) => {
      const isOverdue = row.timing_status === 'overdue'
      const dueDate = row.due_date_effective ?? row.due_date
      return <span className={isOverdue ? 'font-medium text-negative-600' : undefined}>{formatDate(dueDate)}</span>
    },
  },
  {
    key: 'turnover',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.turnoverHeader,
    dir: 'ltr',
    kind: 'money',
    render: (row) =>
      row.turnover_amount ? (
        formatShekelAmount(row.turnover_amount)
      ) : row.live_turnover ? (
        <span className="italic text-gray-400">{formatShekelAmount(row.live_turnover)}</span>
      ) : (
        <EmptyCell />
      ),
  },
  moneyColumn({
    key: 'expected_amount',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.expectedHeader,
    tone: 'strong',
    getValue: (row) => formatShekelAmount(row.expected_amount),
  }),
  moneyColumn({
    key: 'paid_amount',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.paidHeader,
    tone: 'muted',
    getValue: (row) => formatShekelAmount(row.paid_amount),
  }),
  {
    key: 'delta',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.balanceHeader,
    dir: 'ltr',
    kind: 'money',
    render: (row) =>
      row.delta == null ? (
        <EmptyCell />
      ) : Number(row.delta) > 0 ? (
        <span className="font-semibold text-negative-600">{formatShekelAmount(row.delta)}</span>
      ) : (
        <span className="text-gray-500">{formatShekelAmount(row.delta)}</span>
      ),
  },
  numberColumn({
    key: 'advance_rate',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.advanceRateHeader,
    tone: 'muted',
    getValue: (row) => (row.advance_rate != null ? formatPercent(row.advance_rate, { fractionDigits: 2 }) : null),
  }),
  statusColumn({
    key: 'status',
    header: GLOBAL_UI_MESSAGES.common.status,
    getStatus: (row) => row.status,
    getLabel: getAdvancePaymentStatusLabel,
    variantMap: ADVANCE_PAYMENT_STATUS_VARIANTS,
  }),
  actionsColumn({
    key: 'actions',
    header: '',
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
  }),
]
