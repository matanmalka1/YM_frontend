import { GLOBAL_UI_MESSAGES } from '@/messages'
import {
  actionsColumn,
  buildSelectionColumn,
  dateColumn,
  monoColumn,
  statusColumn,
  textColumn,
  type Column,
} from '../../../../components/ui/table'
import type { ChargeListItem } from '../../api'
import { getChargeAmountText, getChargePeriodLabel } from '../../utils/chargeUtils'
import { formatClientOfficeId } from '../../../../utils/utils'
import { getChargeStatusLabel, getChargeTypeLabel } from '../../constants'
import { ChargeRowActions } from './ChargeRowActions'
import { chargeStatusVariants } from '../../constants'
import type { ChargeAction } from '../../types'
import { ChargeClientCell } from './ChargeClientCell'
import type { NotificationTrigger } from '@/features/notifications'
import { CHARGES_MESSAGES } from '../../messages'

interface BuildChargeColumnsParams {
  isAdvisor: boolean
  /** false on the client-details tab — the page already is the client. */
  includeClientColumns: boolean
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
  includeClientColumns,
  actionLoadingId,
  runAction,
  onOpenDetail,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  allIds = [],
  onSendNotification,
}: BuildChargeColumnsParams): Column<ChargeListItem>[] => {
  const clientIdentityColumns: Column<ChargeListItem>[] = [
    monoColumn({
      key: 'office_client_number',
      header: CHARGES_MESSAGES.columns.clientNumber,
      getValue: (charge) => formatClientOfficeId(charge.office_client_number),
    }),
    {
      key: 'client_record_id',
      header: GLOBAL_UI_MESSAGES.common.client,
      render: (charge) => <ChargeClientCell charge={charge} />,
    },
  ]

  const dataColumns: Column<ChargeListItem>[] = [
    ...(includeClientColumns ? clientIdentityColumns : []),
    textColumn({
      key: 'charge_type',
      header: CHARGES_MESSAGES.columns.type,
      getValue: (charge) => getChargeTypeLabel(charge.charge_type),
    }),
    textColumn({
      key: 'period',
      header: CHARGES_MESSAGES.columns.period,
      getValue: (charge) => getChargePeriodLabel(charge.period, charge.months_covered),
    }),
    statusColumn({
      key: 'status',
      header: GLOBAL_UI_MESSAGES.common.status,
      getStatus: (charge) => charge.status,
      getLabel: getChargeStatusLabel,
      variantMap: chargeStatusVariants,
    }),
    dateColumn({
      key: 'issued_at',
      header: CHARGES_MESSAGES.columns.issued,
      getValue: (charge) => charge.issued_at,
    }),
    dateColumn({
      key: 'paid_at',
      header: CHARGES_MESSAGES.columns.paid,
      getValue: (charge) => charge.paid_at,
    }),
    monoColumn({
      key: 'amount',
      header: CHARGES_MESSAGES.columns.amount,
      tone: 'strong',
      getValue: (charge) => getChargeAmountText(charge),
    }),
    dateColumn({
      key: 'created_at',
      header: CHARGES_MESSAGES.columns.created,
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
          onIssue={() => void runAction(charge.id, 'issue_charge')}
          onMarkPaid={() => void runAction(charge.id, 'mark_paid')}
          onCancel={() => void runAction(charge.id, 'cancel_charge')}
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
    header: CHARGES_MESSAGES.columns.chargeNumber,
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
        getItemAriaLabel: (charge) => CHARGES_MESSAGES.actions.selectChargeAria(charge.id),
      }),
      idColumn,
      ...dataColumns,
    ]
  }

  return [idColumn, ...dataColumns]
}
