import { GLOBAL_UI_MESSAGES } from '@/messages'
import { actionsColumn, monoColumn, statusColumn, textColumn, type Column } from '../../../components/ui/table'
import type { SearchResult } from '../api'
import { getResultIcon, getResultLabel, getResultVariant } from '../utils/searchResultMeta'
import { SearchRowActions } from './SearchRowActions'
import { Badge } from '@/components/ui/primitives/Badge'
import { CLIENT_STATUS_BADGE_VARIANTS, getClientStatusLabel } from '@/features/clients'
import { formatBinderNumber, formatClientOfficeId } from '@/utils/utils'
import { SEARCH_MESSAGES } from '../messages'

export const searchColumns: Column<SearchResult>[] = [
  monoColumn({
    key: 'office_client_number',
    header: SEARCH_MESSAGES.columns.officeNumber,
    headerClassName: 'w-px whitespace-nowrap',
    getValue: (result) => formatClientOfficeId(result.office_client_number),
  }),
  {
    key: 'type',
    header: SEARCH_MESSAGES.columns.type,
    headerClassName: 'w-px whitespace-nowrap',
    render: (result) => (
      <Badge variant={getResultVariant(result.result_type)} size="xs" icon={getResultIcon(result.result_type)}>
        {getResultLabel(result.result_type)}
      </Badge>
    ),
  },
  textColumn({
    key: 'client',
    header: GLOBAL_UI_MESSAGES.common.client,
    tone: 'strong',
    getValue: (result) => result.client_name,
  }),
  statusColumn({
    key: 'client_status',
    header: GLOBAL_UI_MESSAGES.common.status,
    headerClassName: 'w-px whitespace-nowrap',
    getStatus: (result) => result.client_status ?? '',
    getLabel: getClientStatusLabel,
    variantMap: CLIENT_STATUS_BADGE_VARIANTS,
  }),
  monoColumn({
    key: 'id_number',
    header: SEARCH_MESSAGES.columns.idNumber,
    headerClassName: 'w-px whitespace-nowrap',
    getValue: (result) => result.id_number,
  }),
  monoColumn({
    key: 'binder_number',
    header: SEARCH_MESSAGES.columns.binderNumber,
    headerClassName: 'w-px whitespace-nowrap',
    getValue: (result) => (result.binder_number ? formatBinderNumber(result.binder_number) : null),
  }),
  actionsColumn({
    header: '',
    headerClassName: 'w-px',
    render: (result) => <SearchRowActions result={result} />,
  }),
]
