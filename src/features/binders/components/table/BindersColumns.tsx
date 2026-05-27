import { Link } from 'react-router-dom'
import { actionsColumn, monoColumn, statusColumn, textColumn, type Column } from '@/components/ui/table'
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

const ClientCell: React.FC<{ binder: BinderResponse }> = ({ binder }) => (
  <span className="flex flex-col gap-0.5">
    <Link
      to={`/clients/${binder.client_record_id}`}
      onClick={(e) => e.stopPropagation()}
      className="text-sm font-semibold text-gray-900 hover:text-primary-700 hover:underline"
    >
      {binder.client_name ?? `#${binder.client_record_id}`}
    </Link>
  </span>
)
ClientCell.displayName = 'ClientCell'

interface BuildBindersColumnsParams {
  actionLoadingId: number | null
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

export const buildBindersColumns = ({
  actionLoadingId,
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
}: BuildBindersColumnsParams): Column<BinderResponse>[] => [
  monoColumn({ key: 'office_client_number', header: "מס' לקוח", getValue: (binder) => formatClientOfficeId(binder.office_client_number) }),
  textColumn({ key: 'client_name', header: 'לקוח', getValue: (binder) => <ClientCell binder={binder} /> }),
  monoColumn({ key: 'client_id_number', header: 'ת.ז / ח.פ', getValue: (binder) => binder.client_id_number }),
  monoColumn({ key: 'binder_number', header: 'מספר קלסר', valueClassName: 'font-semibold text-gray-700', getValue: (binder) => formatBinderNumber(binder.binder_number) }),
  statusColumn({
    key: 'location_status',
    header: 'מיקום',
    getStatus: (binder) => binder.location_status,
    getLabel: getBinderLocationStatusLabel,
    variantMap: BINDER_LOCATION_STATUS_VARIANTS,
  }),
  statusColumn({
    key: 'capacity_status',
    header: 'קיבולת',
    getStatus: (binder) => binder.capacity_status,
    getLabel: getBinderCapacityStatusLabel,
    variantMap: BINDER_CAPACITY_STATUS_VARIANTS,
  }),
  textColumn({
    key: 'period_start',
    header: 'תקופה',
    valueClassName: 'text-gray-600 tabular-nums',
    getValue: (binder) => {
      if (!binder.period_start && !binder.period_end) return <span className="text-gray-400">—</span>
      const start = formatMonthYear(binder.period_start)
      const end = binder.period_end ? formatMonthYear(binder.period_end) : 'פעיל'
      return `${start} - ${end}`
    },
  }),
  {
    key: 'days_in_office',
    header: 'ימים במשרד',
    render: (binder) => <MonoValue value={binder.days_in_office} format="days" isInactive={binder.location_status === 'handed_over'} />,
  },
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
