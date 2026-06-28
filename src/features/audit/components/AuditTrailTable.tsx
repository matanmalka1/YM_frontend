import { type Column, type DataTableProps } from '@/components/ui/table/DataTable'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import { cn, formatDateTime } from '@/utils/utils'
import { AUDIT_MESSAGES } from '../messages'

type AuditTrailTableEntry = {
  id: number
  performed_at: string
  performed_by: number
  performed_by_name?: string | null
  action: string
}

type AuditTrailTableProps<TEntry extends AuditTrailTableEntry> = {
  items: TEntry[]
  actionLabels: Record<string, string>
  formatDetails: (entry: TEntry) => string
  /** Zero-based current page. */
  page: number
  pageSize: number
  total: number
  isFetching: boolean
  /** Receives the zero-based next page. */
  onPageChange: (page: number) => void
  detailsClassName?: string
  surface?: DataTableProps<TEntry>['surface']
}

export const AuditTrailTable = <TEntry extends AuditTrailTableEntry>({
  items,
  actionLabels,
  formatDetails,
  page,
  pageSize,
  total,
  isFetching,
  onPageChange,
  detailsClassName = 'text-xs text-gray-500',
  surface = 'embedded',
}: AuditTrailTableProps<TEntry>) => {
  const columns: Column<TEntry>[] = [
    {
      key: 'performed_at',
      header: AUDIT_MESSAGES.table.columnDate,
      className: 'w-36 text-gray-600 tabular-nums',
      render: (entry) => formatDateTime(entry.performed_at),
    },
    {
      key: 'action',
      header: AUDIT_MESSAGES.table.columnAction,
      className: 'w-24 font-semibold text-gray-900',
      render: (entry) => actionLabels[entry.action] ?? entry.action,
    },
    {
      key: 'details',
      header: AUDIT_MESSAGES.table.columnDetails,
      wrap: true,
      className: cn('min-w-48 break-words', detailsClassName),
      render: (entry) => formatDetails(entry),
    },
    {
      key: 'performed_by',
      header: AUDIT_MESSAGES.table.columnPerformedBy,
      className: 'w-24 font-mono text-gray-700 tabular-nums',
      render: (entry) => entry.performed_by_name ?? `#${entry.performed_by}`,
    },
  ]

  return (
    <PaginatedDataTable
      data={items}
      columns={columns}
      getRowKey={(entry) => entry.id}
      surface={surface}
      isFetching={isFetching}
      page={page + 1}
      pageSize={pageSize}
      total={total}
      onPageChange={(nextPage) => onPageChange(nextPage - 1)}
      showPagination={total > pageSize}
    />
  )
}

AuditTrailTable.displayName = 'AuditTrailTable'
