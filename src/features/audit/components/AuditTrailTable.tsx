import { GLOBAL_UI_MESSAGES } from '@/messages'
import {
  dateTimeColumn,
  monoColumn,
  textColumn,
  PaginatedDataTable,
  type Column,
  type DataTableProps,
} from '@/components/ui/table'
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
  detailsTruncate?: boolean
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
  detailsTruncate = false,
  surface = 'embedded',
}: AuditTrailTableProps<TEntry>) => {
  const columns: Column<TEntry>[] = [
    dateTimeColumn({
      key: 'performed_at',
      header: GLOBAL_UI_MESSAGES.common.date,
      getValue: (entry) => entry.performed_at,
    }),
    textColumn({
      key: 'action',
      header: AUDIT_MESSAGES.table.columnAction,
      tone: 'strong',
      getValue: (entry) => actionLabels[entry.action] ?? entry.action,
    }),
    textColumn({
      key: 'details',
      header: GLOBAL_UI_MESSAGES.common.details,
      wrap: true,
      truncate: detailsTruncate,
      tone: 'muted',
      className: 'break-words',
      getValue: (entry) => formatDetails(entry),
    }),
    monoColumn({
      key: 'performed_by',
      header: AUDIT_MESSAGES.table.columnPerformedBy,
      getValue: (entry) => entry.performed_by_name ?? `#${entry.performed_by}`,
    }),
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
