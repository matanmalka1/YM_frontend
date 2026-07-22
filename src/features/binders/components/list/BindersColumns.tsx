import { GLOBAL_UI_MESSAGES } from '@/messages'
import { actionsColumn, EmptyCell, monoColumn, statusColumn, textColumn, type Column } from '@/components/ui/table'
import { MonoValue } from '@/components/ui/primitives/MonoValue'
import type { BinderResponse } from '../../types'
import {
  BINDER_CAPACITY_STATUS_VARIANTS,
  BINDER_LOCATION_STATUS_VARIANTS,
  getBinderCapacityStatusLabel,
  getBinderLocationStatusLabel,
} from '../../constants'
import { formatBinderNumber, formatClientOfficeId, formatMonthYear } from '@/utils/utils'
import { BinderRowActions } from './BinderRowActions'
import { BINDERS_MESSAGES } from '../../messages'

const renderClientCell = (binder: BinderResponse) => (
  <span className="flex flex-col gap-0.5">
    <span className="font-semibold text-gray-900">{binder.client_name ?? `#${binder.client_record_id}`}</span>
  </span>
)

const buildBinderBaseColumns = (): Column<BinderResponse>[] => [
  monoColumn({
    key: 'binder_number',
    header: BINDERS_MESSAGES.columns.binderNumber,
    getValue: (binder) => formatBinderNumber(binder.binder_number),
  }),
  statusColumn({
    key: 'location_status',
    header: BINDERS_MESSAGES.columns.location,
    getStatus: (binder) => binder.location_status,
    getLabel: getBinderLocationStatusLabel,
    variantMap: BINDER_LOCATION_STATUS_VARIANTS,
  }),
  statusColumn({
    key: 'capacity_status',
    header: BINDERS_MESSAGES.columns.capacity,
    getStatus: (binder) => binder.capacity_status,
    getLabel: getBinderCapacityStatusLabel,
    variantMap: BINDER_CAPACITY_STATUS_VARIANTS,
  }),
  {
    key: 'period_start',
    header: BINDERS_MESSAGES.columns.period,
    kind: 'number',
    tone: 'muted',
    align: 'start',
    render: (binder) => {
      if (!binder.period_start && !binder.period_end) return <EmptyCell />
      const start = formatMonthYear(binder.period_start)
      const end = binder.period_end ? formatMonthYear(binder.period_end) : BINDERS_MESSAGES.period.active
      return `${start} - ${end}`
    },
  },
  {
    key: 'days_in_office',
    header: BINDERS_MESSAGES.columns.daysInOffice,
    render: (binder) => (
      <MonoValue value={binder.days_in_office} format="days" isInactive={binder.location_status === 'handed_over'} />
    ),
  },
]

interface BuildGlobalBinderColumnsParams {
  actionLoadingId: number | null
  /** false on the client-details tab — the page already is the client, so client-identity columns are omitted. */
  includeClientColumns: boolean
  onReceiveMaterial: (binderId: number) => void
  onMarkFull: (binderId: number) => void
  onReopenCapacity: (binderId: number) => void
  onMarkReadyForHandover: (binderId: number) => void
  onMarkReadyForHandoverBulk: (binderId: number) => void
  onRevertReadyForHandover: (binderId: number) => void
  onHandoverToClient: (binderId: number) => void
  onHandoverToClientBulk: (binderId: number) => void
  onOpenDetail: (binderId: number) => void
  onDelete: (binderId: number) => void
}

export const buildGlobalBinderColumns = ({
  actionLoadingId,
  includeClientColumns,
  onReceiveMaterial,
  onMarkFull,
  onReopenCapacity,
  onMarkReadyForHandover,
  onMarkReadyForHandoverBulk,
  onRevertReadyForHandover,
  onHandoverToClient,
  onHandoverToClientBulk,
  onOpenDetail,
  onDelete,
}: BuildGlobalBinderColumnsParams): Column<BinderResponse>[] => [
  ...(includeClientColumns
    ? [
        monoColumn<BinderResponse>({
          key: 'office_client_number',
          header: BINDERS_MESSAGES.columns.officeClientNumber,
          getValue: (binder) => formatClientOfficeId(binder.office_client_number),
        }),
        textColumn<BinderResponse>({
          key: 'client_name',
          header: GLOBAL_UI_MESSAGES.common.clientName,
          getValue: (binder) => renderClientCell(binder),
        }),
        monoColumn<BinderResponse>({
          key: 'client_id_number',
          header: BINDERS_MESSAGES.columns.idNumber,
          getValue: (binder) => binder.client_id_number,
        }),
      ]
    : []),
  ...buildBinderBaseColumns(),
  actionsColumn({
    key: 'actions',
    header: '',
    render: (binder) => (
      <BinderRowActions
        binder={binder}
        disabled={actionLoadingId === binder.id}
        onOpenDetail={() => onOpenDetail(binder.id)}
        onReceiveMaterial={() => onReceiveMaterial(binder.id)}
        onMarkFull={() => onMarkFull(binder.id)}
        onReopenCapacity={() => onReopenCapacity(binder.id)}
        onMarkReadyForHandover={() => onMarkReadyForHandover(binder.id)}
        onMarkReadyForHandoverBulk={() => onMarkReadyForHandoverBulk(binder.id)}
        onRevertReadyForHandover={() => onRevertReadyForHandover(binder.id)}
        onHandoverToClient={() => onHandoverToClient(binder.id)}
        onHandoverToClientBulk={() => onHandoverToClientBulk(binder.id)}
        onDelete={() => onDelete(binder.id)}
      />
    ),
  }),
]
