import { GLOBAL_UI_MESSAGES } from '@/messages'
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
    getValue: (result) => formatClientOfficeId(result.office_client_number),
  }),
  {
    key: 'type',
    header: SEARCH_MESSAGES.columns.type,
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
    header: GLOBAL_UI_MESSAGES.common.client,
    tone: 'strong',
    getValue: (result) => result.client_name,
  }),
  monoColumn({
    key: 'id_number',
    header: SEARCH_MESSAGES.columns.idNumber,
    getValue: (result) => result.id_number,
  }),
  monoColumn({
    key: 'binder_number',
    header: SEARCH_MESSAGES.columns.binderNumber,
    getValue: (result) => (result.binder_number ? formatBinderNumber(result.binder_number) : null),
  }),
  actionsColumn({
    header: '',
    render: (result) => <SearchRowActions result={result} />,
  }),
]
