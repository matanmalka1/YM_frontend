import { AlertTriangle, Edit, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table/RowActions'
import { formatClientOfficeId, formatDate, formatShekelAmount } from '@/utils/utils'
import type { AdvancePaymentOverviewRow } from '../api/contracts'
import { AdvancePaymentStatusBadge } from './AdvancePaymentStatusBadge'
import { getAdvancePaymentMonthLabel } from './advancePaymentComponent.utils'

interface AdvancePaymentBatchTableRowProps {
  row: AdvancePaymentOverviewRow
  onRowClick: (row: AdvancePaymentOverviewRow) => void
  onNavigateToClient: (clientRecordId: number) => void
}

export const AdvancePaymentBatchTableRow = ({
  row,
  onRowClick,
  onNavigateToClient,
}: AdvancePaymentBatchTableRowProps) => {
  const isOverdue = row.timing_status === 'overdue'
  const dueDate = row.due_date_effective ?? row.due_date

  return (
    <tr
      className={`cursor-pointer border-t border-gray-100 transition-colors ${
        isOverdue ? 'bg-negative-50/30 hover:bg-negative-50/60' : 'hover:bg-info-50/40'
      }`}
      onClick={() => onRowClick(row)}
    >
      <td className="px-3 py-1.5 align-middle text-sm tabular-nums text-gray-400">
        {formatClientOfficeId(row.office_client_number)}
      </td>
      <td className="w-48 px-3 py-1.5 align-middle">
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
            חסר מחזור
          </span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-1.5 align-middle text-sm text-gray-600">
        {getAdvancePaymentMonthLabel(row.period, row.period_months_count)} {row.period.substring(0, 4)}
      </td>
      <td
        className={`whitespace-nowrap px-3 py-1.5 align-middle text-sm tabular-nums ${
          isOverdue ? 'font-medium text-negative-600' : 'text-gray-500'
        }`}
      >
        {formatDate(dueDate)}
      </td>
      <td dir="ltr" className="px-3 py-1.5 text-center align-middle text-sm tabular-nums">
        {row.turnover_amount ? (
          <span className="text-gray-700">{formatShekelAmount(row.turnover_amount)}</span>
        ) : row.live_turnover ? (
          <span className="italic text-gray-400">{formatShekelAmount(row.live_turnover)}</span>
        ) : (
          <span className="text-gray-500">—</span>
        )}
      </td>
      <td dir="ltr" className="px-3 py-1.5 text-center align-middle text-sm font-semibold tabular-nums text-gray-800">
        {formatShekelAmount(row.expected_amount)}
      </td>
      <td dir="ltr" className="px-3 py-1.5 text-center align-middle text-sm tabular-nums text-gray-600">
        {formatShekelAmount(row.paid_amount)}
      </td>
      <td dir="ltr" className="px-3 py-1.5 text-center align-middle text-sm tabular-nums">
        {row.delta == null ? (
          <span className="text-gray-500">—</span>
        ) : Number(row.delta) > 0 ? (
          <span className="font-semibold text-negative-600">{formatShekelAmount(row.delta)}</span>
        ) : (
          <span className="text-gray-500">{formatShekelAmount(row.delta)}</span>
        )}
      </td>
      <td dir="ltr" className="px-3 py-1.5 text-center align-middle text-sm tabular-nums text-gray-600">
        {row.advance_rate != null ? (
          `${Number(row.advance_rate).toFixed(2)}%`
        ) : (
          <span className="text-gray-500">—</span>
        )}
      </td>
      <td className="px-3 py-1.5 text-center align-middle">
        <AdvancePaymentStatusBadge status={row.status} />
      </td>
      <td className="px-3 py-1.5 align-middle" onClick={(event) => event.stopPropagation()}>
        <RowActionsMenu ariaLabel={`פעולות למקדמה ${row.id}`}>
          <RowActionItem label="עדכן תשלום" icon={<Edit className="h-3.5 w-3.5" />} onClick={() => onRowClick(row)} />
          <RowActionItem
            label="עבור ללקוח"
            icon={<ExternalLink className="h-3.5 w-3.5" />}
            onClick={() => onNavigateToClient(row.client_record_id)}
          />
        </RowActionsMenu>
      </td>
    </tr>
  )
}
