import { Button } from '@/components/ui/primitives/Button'
import { DataTable, type Column } from '@/components/ui/table/DataTable'
import { cn, formatDateTime } from '@/utils/utils'
import { AUDIT_MESSAGES } from '../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

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
  totalPages: number
  maxPage: number
  safePage: number
  isFetching: boolean
  setPage: (page: number) => void
  detailsClassName?: string
}

export const AuditTrailTable = <TEntry extends AuditTrailTableEntry>({
  items,
  actionLabels,
  formatDetails,
  totalPages,
  maxPage,
  safePage,
  isFetching,
  setPage,
  detailsClassName = 'text-xs text-gray-500',
}: AuditTrailTableProps<TEntry>) => {
  const columns: Column<TEntry>[] = [
    {
      key: 'performed_at',
      header: AUDIT_MESSAGES.table.columnDate,
      align: 'right',
      className: 'w-36 text-gray-500 tabular-nums',
      render: (entry) => formatDateTime(entry.performed_at),
    },
    {
      key: 'action',
      header: AUDIT_MESSAGES.table.columnAction,
      align: 'right',
      className: 'w-24 font-medium text-gray-800',
      render: (entry) => actionLabels[entry.action] ?? entry.action,
    },
    {
      key: 'details',
      header: AUDIT_MESSAGES.table.columnDetails,
      align: 'right',
      wrap: true,
      className: cn('min-w-48 break-words', detailsClassName),
      render: (entry) => formatDetails(entry),
    },
    {
      key: 'performed_by',
      header: AUDIT_MESSAGES.table.columnPerformedBy,
      align: 'right',
      className: 'w-24 font-mono text-xs text-gray-400',
      render: (entry) => entry.performed_by_name ?? `#${entry.performed_by}`,
    },
  ]

  return (
    <div className="space-y-3">
      <DataTable data={items} columns={columns} getRowKey={(entry) => entry.id} surface="embedded" />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPage(Math.max(0, safePage - 1))}
            disabled={safePage === 0 || isFetching}
          >
            {GLOBAL_UI_MESSAGES.pagination.previousPage}
          </Button>
          <span>
            {isFetching
              ? GLOBAL_UI_MESSAGES.common.loading
              : GLOBAL_UI_MESSAGES.pagination.pageSummary(safePage + 1, totalPages)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPage(Math.min(maxPage, safePage + 1))}
            disabled={safePage >= maxPage || isFetching}
          >
            {GLOBAL_UI_MESSAGES.pagination.nextPage}
          </Button>
        </div>
      )}
    </div>
  )
}

AuditTrailTable.displayName = 'AuditTrailTable'
