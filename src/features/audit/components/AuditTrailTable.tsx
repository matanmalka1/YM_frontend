import { Button } from '@/components/ui/primitives/Button'
import { formatDateTime } from '@/utils/utils'

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
}: AuditTrailTableProps<TEntry>) => (
  <div className="space-y-3">
    <div className="overflow-x-auto rounded-lg border border-gray-100" dir="rtl">
      <table className="w-full border-collapse text-sm">
        <colgroup>
          <col className="w-36" />
          <col className="w-24" />
          <col className="min-w-48" />
          <col className="w-24" />
        </colgroup>
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 text-right">תאריך</th>
            <th className="px-4 py-3 text-right">פעולה</th>
            <th className="px-4 py-3 text-right">פרטים</th>
            <th className="px-4 py-3 text-right">בוצע ע&quot;י</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50/60">
              <td className="px-4 py-3 text-gray-500 tabular-nums whitespace-nowrap">
                {formatDateTime(entry.performed_at)}
              </td>
              <td className="px-4 py-3 font-medium text-gray-800">{actionLabels[entry.action] ?? entry.action}</td>
              <td className={`break-words px-4 py-3 ${detailsClassName}`}>{formatDetails(entry)}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-400">
                {entry.performed_by_name ?? `#${entry.performed_by}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {totalPages > 1 && (
      <div className="flex items-center justify-between text-sm text-gray-500" dir="rtl">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setPage(Math.max(0, safePage - 1))}
          disabled={safePage === 0 || isFetching}
        >
          הקודם
        </Button>
        <span>{isFetching ? 'טוען...' : `עמוד ${safePage + 1} מתוך ${totalPages}`}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setPage(Math.min(maxPage, safePage + 1))}
          disabled={safePage >= maxPage || isFetching}
        >
          הבא
        </Button>
      </div>
    )}
  </div>
)

AuditTrailTable.displayName = 'AuditTrailTable'
