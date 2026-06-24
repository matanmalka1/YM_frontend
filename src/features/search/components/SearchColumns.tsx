import { actionsColumn, monoColumn, textColumn, type Column } from '../../../components/ui/table'
import type { SearchResult } from '../api'
import { getResultColor, getResultIcon, getResultLabel } from '../utils/searchResultMeta'
import { SearchRowActions } from './SearchRowActions'
import { cn, formatBinderNumber, formatClientOfficeId } from '@/utils/utils'
import { SEARCH_MESSAGES } from '../messages'

export const searchColumns: Column<SearchResult>[] = [
  monoColumn({
    key: 'office_client_number',
    header: SEARCH_MESSAGES.columns.officeNumber,
    valueClassName: 'text-xs text-gray-400',
    getValue: (result) => formatClientOfficeId(result.office_client_number),
  }),
  {
    key: 'type',
    header: SEARCH_MESSAGES.columns.type,
    headerClassName: 'w-28',
    render: (result) => (
      <div className="flex items-center gap-2">
        <div className={cn('rounded-lg p-1.5', getResultColor(result.result_type))}>
          {getResultIcon(result.result_type)}
        </div>
        <span className="text-xs font-medium text-gray-600">{getResultLabel(result.result_type)}</span>
      </div>
    ),
  },
  textColumn({
    key: 'client',
    header: SEARCH_MESSAGES.columns.client,
    valueClassName: 'font-semibold text-gray-900',
    getValue: (result) => result.client_name,
  }),
  monoColumn({
    key: 'id_number',
    header: SEARCH_MESSAGES.columns.idNumber,
    valueClassName: 'text-gray-700',
    emptyValue: <span className="text-gray-300">—</span>,
    getValue: (result) => result.id_number,
  }),
  monoColumn({
    key: 'binder_number',
    header: SEARCH_MESSAGES.columns.binderNumber,
    valueClassName: 'font-semibold text-gray-800',
    emptyValue: <span className="text-gray-300">—</span>,
    getValue: (result) => (result.binder_number ? formatBinderNumber(result.binder_number) : null),
  }),
  actionsColumn({
    header: '',
    render: (result) => <SearchRowActions result={result} />,
  }),
]
