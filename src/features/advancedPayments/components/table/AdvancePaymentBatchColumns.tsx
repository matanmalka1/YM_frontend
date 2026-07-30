import { GLOBAL_UI_MESSAGES } from '@/messages'
import { AlertTriangle, Edit, ExternalLink, Info } from 'lucide-react'
import {
  actionsColumn,
  buildSelectionColumn,
  EmptyCell,
  moneyColumn,
  monoColumn,
  numberColumn,
  RowActionItem,
  RowActionsMenu,
  statusColumn,
  type Column,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/primitives/Badge'
import { formatClientOfficeId, formatDate, formatPercent, formatShekelAmount } from '@/utils/utils'
import type { AdvancePaymentOverviewRow } from '../../api/contracts'
import { formatRelativeDueLabel } from '@/components/ui/grouping/groupedPeriodRow.utils'
import { ADVANCE_PAYMENT_STATUS_VARIANTS, getAdvancePaymentStatusLabel } from '../../constants'
import { getAdvancePaymentDueDate, getAdvancePaymentMonthLabel } from '../../utils/advancePaymentComponentUtils'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

export interface AdvancePaymentRowSelection {
  selectedIds: Set<number>
  onToggleSelect: (id: number) => void
  onToggleAll: (ids: number[]) => void
}

interface AdvancePaymentBatchColumnOpts {
  /** Ids of the rows currently rendered — the select-all scope. */
  visibleRowIds: number[]
  selection?: AdvancePaymentRowSelection
  onRowClick: (row: AdvancePaymentOverviewRow) => void
  onNavigateToClient: (clientRecordId: number) => void
}

export const buildAdvancePaymentBatchColumns = ({
  visibleRowIds,
  selection,
  onRowClick,
  onNavigateToClient,
}: AdvancePaymentBatchColumnOpts): Column<AdvancePaymentOverviewRow>[] => [
  ...(selection
    ? [
        buildSelectionColumn<AdvancePaymentOverviewRow>({
          allIds: visibleRowIds,
          getId: (row) => row.id,
          getItemAriaLabel: (row) => ADVANCED_PAYMENTS_MESSAGES.bulkMarkPaid.selectRowAriaLabel(row.id),
          selectAllAriaLabel: ADVANCED_PAYMENTS_MESSAGES.bulkMarkPaid.selectAllAriaLabel,
          selectedIds: selection.selectedIds,
          onToggleSelect: selection.onToggleSelect,
          onToggleAll: selection.onToggleAll,
        }),
      ]
    : []),
  monoColumn({
    key: 'office_client_number',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.officeNumberHeader,
    getValue: (row) => formatClientOfficeId(row.office_client_number),
  }),
  {
    key: 'client_name',
    header: GLOBAL_UI_MESSAGES.common.clientName,
    wrap: true,
    render: (row) => (
      <>
        <span className="block font-semibold leading-snug text-gray-900">{row.client_name}</span>
        {row.missing_turnover && (
          <span className="mt-0.5 inline-flex items-center gap-1 rounded border border-warning-200 bg-warning-50 px-1.5 py-0.5 text-xs font-semibold text-warning-700">
            <AlertTriangle className="h-2.5 w-2.5" />
            {ADVANCED_PAYMENTS_MESSAGES.detail.turnoverMissingBadge}
          </span>
        )}
        {row.turnover_amount == null && row.available_turnover != null && (
          <span className="mt-0.5 inline-flex items-center gap-1 rounded border border-info-200 bg-info-50 px-1.5 py-0.5 text-xs font-semibold text-info-700">
            <Info className="h-2.5 w-2.5" />
            {ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.availableBadge}
          </span>
        )}
        {row.vat_turnover_mismatch != null && (
          <span className="mt-0.5 inline-flex items-center gap-1 rounded border border-warning-200 bg-warning-50 px-1.5 py-0.5 text-xs font-semibold text-warning-700">
            <AlertTriangle className="h-2.5 w-2.5" />
            {ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.mismatchBadge}
          </span>
        )}
      </>
    ),
  },
  monoColumn({
    key: 'id_number',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.idNumberHeader,
    getValue: (row) => row.id_number,
  }),
  {
    key: 'period',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.periodHeader,
    // A chain shows as one row everywhere (D-12), so without the badge this cell
    // reads as the payment originally closed for the period rather than as the
    // correction that replaced it.
    render: (row) => (
      <span className="flex flex-wrap items-center gap-1.5">
        {`${getAdvancePaymentMonthLabel(row.period, row.period_months_count)} ${row.period.substring(0, 4)}`}
        {row.amends_id != null && <Badge variant="warning">{ADVANCED_PAYMENTS_MESSAGES.chain.amendment}</Badge>}
      </span>
    ),
  },
  {
    key: 'due_date',
    header: ADVANCED_PAYMENTS_MESSAGES.detail.dueDateLabel,
    kind: 'date',
    render: (row) => {
      const isOverdue = row.timing_status === 'overdue'
      const dueDate = getAdvancePaymentDueDate(row)
      const overdueLabel = isOverdue && dueDate != null ? formatRelativeDueLabel(dueDate) : null
      return (
        <span className={isOverdue ? 'font-medium text-negative-600' : undefined}>
          {formatDate(dueDate, ADVANCED_PAYMENTS_MESSAGES.detail.noNewDueDateDescription)}
          {overdueLabel != null && <span className="block text-xs font-semibold">{overdueLabel}</span>}
        </span>
      )
    },
  },
  {
    key: 'turnover',
    header: ADVANCED_PAYMENTS_MESSAGES.editableSections.reportedTurnoverCell,
    dir: 'ltr',
    kind: 'money',
    // The money cell shows only what the payment holds. An available VAT figure
    // is a pending action, so it renders as a badge in the client column instead.
    render: (row) => (row.turnover_amount ? formatShekelAmount(row.turnover_amount) : <EmptyCell />),
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
    key: 'withheld_amount',
    header: ADVANCED_PAYMENTS_MESSAGES.batchColumns.withheldHeader,
    dir: 'ltr',
    kind: 'money',
    render: (row) => (row.withheld_amount ? formatShekelAmount(row.withheld_amount) : <EmptyCell />),
  },
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
