import {
  actionsColumn,
  buildSelectionColumn,
  dateColumn,
  monoColumn,
  statusColumn,
  textColumn,
  type Column,
} from '../../../../components/ui/table'
import type { ClientRecordListItem } from '../../api'
import { formatClientOfficeId, formatPhoneNumber } from '@/utils/utils'
import { ClientRowActions } from './ClientRowActions'
import { CLIENT_STATUS_BADGE_VARIANTS, getEntityTypeLabel, getClientStatusLabel } from '../../constants'

interface BuildClientColumnsParams {
  selectedIds?: Set<number>
  onToggleSelect?: (id: number) => void
  onToggleAll?: (ids: number[]) => void
  allIds?: number[]
  onEditClient?: (client: ClientRecordListItem) => void
}

export const buildClientColumns = ({
  selectedIds,
  onToggleSelect,
  onToggleAll,
  allIds = [],
  onEditClient,
}: BuildClientColumnsParams = {}): Column<ClientRecordListItem>[] => {
  const dataColumns: Column<ClientRecordListItem>[] = [
    monoColumn({
      key: 'office_client_number',
      header: "מס' לקוח",
      getValue: (client) => formatClientOfficeId(client.office_client_number),
    }),
    textColumn({
      key: 'full_name',
      header: 'שם לקוח',
      valueClassName: 'font-semibold text-gray-900',
      getValue: (client) => client.full_name,
    }),
    monoColumn({
      key: 'id_number',
      header: 'ת.ז / ח.פ',
      getValue: (client) => client.id_number,
    }),
    textColumn({
      key: 'entity_type',
      header: 'סוג ישות',
      getValue: (client) => (client.entity_type ? getEntityTypeLabel(client.entity_type) : null),
    }),
    monoColumn({
      key: 'active_binder_number',
      header: 'מס׳ קלסר פעיל',
      getValue: (client) => client.active_binder_number,
      emptyValue: <span className="text-gray-400 text-sm">אין קלסר פתוח</span>,
    }),
    statusColumn({
      key: 'status',
      header: 'סטטוס',
      getStatus: (client) => client.status,
      getLabel: getClientStatusLabel,
      variantMap: CLIENT_STATUS_BADGE_VARIANTS,
    }),
    monoColumn({
      key: 'phone',
      header: 'טלפון',
      getValue: (client) => formatPhoneNumber(client.phone),
    }),
    textColumn({
      key: 'email',
      header: 'אימייל',
      getValue: (client) => client.email,
    }),
    dateColumn({
      key: 'created_at',
      header: 'נוצר',
      getValue: (client) => client.created_at,
    }),
    actionsColumn({
      render: (client) => (
        <ClientRowActions
          clientId={client.id}
          officeClientNumber={client.office_client_number}
          onEditClient={onEditClient ? () => onEditClient(client) : undefined}
        />
      ),
    }),
  ]

  if (!onToggleSelect) {
    return dataColumns
  }

  return [
    buildSelectionColumn<ClientRecordListItem>({
      allIds,
      selectedIds,
      onToggleSelect,
      onToggleAll,
      getId: (client) => client.id,
      getItemAriaLabel: (client) => `בחר לקוח ${formatClientOfficeId(client.office_client_number)}`,
    }),
    ...dataColumns,
  ]
}
