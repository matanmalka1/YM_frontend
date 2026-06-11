import {
  actionsColumn,
  buildSelectionColumn,
  dateColumn,
  monoColumn,
  statusColumn,
  textColumn,
  type Column,
} from '../../../components/ui/table'
import type { ChargeListItem } from '../api'
import { getChargeAmountText, getChargePeriodLabel, getChargeTypeLabel } from '../utils'
import { formatClientOfficeId } from '../../../utils/utils'
import { getChargeStatusLabel } from '../constants'
import { ChargeRowActions } from './ChargeRowActions'
import { chargeStatusVariants } from '../constants'
import type { ChargeAction } from '../types'
import { ChargeClientCell } from './ChargeClientCell'
import type { NotificationTrigger } from '@/features/notifications'

interface BuildChargeColumnsParams {
  isAdvisor: boolean
  actionLoadingId: number | null
  runAction: (chargeId: number, action: ChargeAction) => Promise<void>
  onOpenDetail: (chargeId: number) => void
  selectedIds?: Set<number>
  onToggleSelect?: (id: number) => void
  onToggleAll?: (ids: number[]) => void
  allIds?: number[]
  onSendNotification?: (charge: ChargeListItem, trigger: NotificationTrigger) => void
}

export const buildChargeColumns = ({
  isAdvisor,
  actionLoadingId,
  runAction,
  onOpenDetail,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  allIds = [],
  onSendNotification,
}: BuildChargeColumnsParams): Column<ChargeListItem>[] => {
  const dataColumns: Column<ChargeListItem>[] = [
    monoColumn({
      key: 'office_client_number',
      header: "מס' לקוח",
      headerClassName: 'w-20',
      className: 'w-20',
      getValue: (charge) => formatClientOfficeId(charge.office_client_number),
    }),
    {
      key: 'client_record_id',
      header: 'לקוח',
      headerClassName: 'w-48',
      className: 'w-48 max-w-[12rem]',
      render: (charge) => <ChargeClientCell charge={charge} />,
    },
    textColumn({
      key: 'charge_type',
      header: 'סוג',
      headerClassName: 'w-24',
      className: 'w-24',
      getValue: (charge) => getChargeTypeLabel(charge.charge_type),
    }),
    textColumn({
      key: 'period',
      header: 'תקופה',
      headerClassName: 'w-28',
      className: 'w-28',
      getValue: (charge) => getChargePeriodLabel(charge.period, charge.months_covered),
    }),
    statusColumn({
      key: 'status',
      header: 'סטטוס',
      headerClassName: 'w-28',
      className: 'w-28',
      getStatus: (charge) => charge.status,
      getLabel: getChargeStatusLabel,
      variantMap: chargeStatusVariants,
    }),
    dateColumn({
      key: 'issued_at',
      header: 'הונפק',
      headerClassName: 'w-24',
      className: 'w-24',
      getValue: (charge) => charge.issued_at,
    }),
    dateColumn({
      key: 'paid_at',
      header: 'שולם',
      headerClassName: 'w-24',
      className: 'w-24',
      getValue: (charge) => charge.paid_at,
    }),
    monoColumn({
      key: 'amount',
      header: 'סכום',
      headerClassName: 'w-36',
      className: 'w-36',
      valueClassName: 'font-semibold text-gray-900',
      getValue: (charge) => getChargeAmountText(charge),
    }),
    dateColumn({
      key: 'created_at',
      header: 'נוצר',
      headerClassName: 'w-24',
      className: 'w-24',
      valueClassName: 'text-gray-500',
      getValue: (charge) => charge.created_at,
    }),
    actionsColumn({
      header: '',
      render: (charge) => (
        <ChargeRowActions
          chargeId={charge.id}
          actions={charge.available_actions}
          disabled={actionLoadingId !== null}
          onOpenDetail={() => onOpenDetail(charge.id)}
          onIssue={() => void runAction(charge.id, 'issue')}
          onMarkPaid={() => void runAction(charge.id, 'markPaid')}
          onCancel={() => void runAction(charge.id, 'cancel')}
          showActions={isAdvisor}
          onSendInvoiceNotification={
            isAdvisor && onSendNotification ? () => onSendNotification(charge, 'invoice_issued') : undefined
          }
          onSendPaymentReminder={
            isAdvisor && onSendNotification ? () => onSendNotification(charge, 'payment_reminder') : undefined
          }
        />
      ),
    }),
  ]

  const idColumn: Column<ChargeListItem> = monoColumn({
    key: 'id',
    header: "מס' חיוב",
    headerClassName: 'w-20',
    className: 'w-20',
    getValue: (charge) => `#${charge.id}`,
  })

  if (isAdvisor && onToggleSelect) {
    return [
      buildSelectionColumn<ChargeListItem>({
        allIds,
        selectedIds,
        onToggleSelect,
        onToggleAll,
        getId: (charge) => charge.id,
        getItemAriaLabel: (charge) => `בחר חיוב ${charge.id}`,
      }),
      idColumn,
      ...dataColumns,
    ]
  }

  return [idColumn, ...dataColumns]
}
