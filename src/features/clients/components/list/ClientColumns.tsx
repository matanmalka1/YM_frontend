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
import { CLIENTS_MESSAGES } from '../../messages'

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
      header: CLIENTS_MESSAGES.columns.officeNumber,
      getValue: (client) => formatClientOfficeId(client.office_client_number),
    }),
    textColumn({
      key: 'full_name',
      header: CLIENTS_MESSAGES.columns.fullName,
      tone: 'strong',
      getValue: (client) => client.full_name,
    }),
    monoColumn({
      key: 'id_number',
      header: CLIENTS_MESSAGES.columns.idNumber,
      getValue: (client) => client.id_number,
    }),
    textColumn({
      key: 'entity_type',
      header: CLIENTS_MESSAGES.columns.entityType,
      getValue: (client) => (client.entity_type ? getEntityTypeLabel(client.entity_type) : null),
    }),
    monoColumn({
      key: 'active_binder_number',
      header: CLIENTS_MESSAGES.columns.activeBinderNumber,
      getValue: (client) => client.active_binder_number,
      emptyValue: CLIENTS_MESSAGES.columns.noOpenBinder,
    }),
    statusColumn({
      key: 'status',
      header: CLIENTS_MESSAGES.columns.status,
      getStatus: (client) => client.status,
      getLabel: getClientStatusLabel,
      variantMap: CLIENT_STATUS_BADGE_VARIANTS,
    }),
    monoColumn({
      key: 'phone',
      header: CLIENTS_MESSAGES.columns.phone,
      getValue: (client) => formatPhoneNumber(client.phone),
    }),
    textColumn({
      key: 'email',
      header: CLIENTS_MESSAGES.columns.email,
      getValue: (client) => client.email,
    }),
    dateColumn({
      key: 'created_at',
      header: CLIENTS_MESSAGES.columns.createdAt,
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
      getItemAriaLabel: (client) =>
        CLIENTS_MESSAGES.list.selectAriaLabel(formatClientOfficeId(client.office_client_number)),
    }),
    ...dataColumns,
  ]
}
