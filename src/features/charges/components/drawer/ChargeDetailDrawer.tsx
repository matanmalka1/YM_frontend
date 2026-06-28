import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Trash2 } from 'lucide-react'
import { DetailDrawer } from '../../../../components/ui/overlays/DetailDrawer'
import { DefinitionList } from '../../../../components/ui/layout/DefinitionList'
import { DrawerSection } from '../../../../components/ui/overlays/DrawerPrimitives'
import { Textarea } from '../../../../components/ui/inputs/Textarea'
import { Alert } from '../../../../components/ui/overlays/Alert'
import { Button } from '../../../../components/ui/primitives/Button'
import { ConfirmDialog } from '../../../../components/ui/overlays/ConfirmDialog'
import { StatusBadge } from '../../../../components/ui/primitives/StatusBadge'
import { EntityAuditTrailSection, type FieldValueLabels } from '@/features/audit'
import {
  getChargeAmountText,
  getChargeClientLabel,
  getChargePeriodLabel,
  canDeleteCharge,
} from '../../utils/chargeUtils'
import { formatDateTime } from '../../../../utils/utils'
import { CHARGE_STATUS_LABELS, CHARGE_TYPE_LABELS, getChargeStatusLabel, getChargeTypeLabel } from '../../constants'
import { ChargeActionButtons } from './ChargeActionButtons'
import { useChargeDetailsPage } from '../../hooks/useChargeDetailsPage'
import { CHARGE_CANCEL_REASON_PLACEHOLDER, chargeStatusVariants } from '../../constants'
import { SendNotificationModal, type NotificationTrigger } from '@/features/notifications'
import { ChargeInvoiceSection } from '@/features/invoices'
import { CHARGES_MESSAGES } from '../../messages'
import { CHARGES_ERROR_MESSAGES } from '../../errorMessages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

const FIELD_VALUE_LABELS: FieldValueLabels = {
  status: CHARGE_STATUS_LABELS,
  charge_type: CHARGE_TYPE_LABELS,
}

interface ChargeDetailDrawerProps {
  chargeId: number | null
  onClose: () => void
}

export const ChargeDetailDrawer: React.FC<ChargeDetailDrawerProps> = ({ chargeId, onClose }) => {
  const { actionLoading, charge, denied, runAction, isAdvisor, deleteCharge, isDeleting } = useChargeDetailsPage(
    chargeId != null ? String(chargeId) : undefined,
  )
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)
  const [notificationTrigger, setNotificationTrigger] = useState<NotificationTrigger | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const clientLabel = charge ? getChargeClientLabel(charge) : ''

  const closeCancelDialog = () => {
    setIsConfirmingCancel(false)
    setCancelReason('')
  }

  const footer =
    charge && isAdvisor ? (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ChargeActionButtons
          actions={charge.available_actions}
          disabled={actionLoading}
          size="sm"
          onIssue={() => void runAction('issue_charge')}
          onMarkPaid={() => void runAction('mark_paid')}
          onCancel={() => setIsConfirmingCancel(true)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setNotificationTrigger('invoice_issued')}
            disabled={actionLoading}
            className="gap-1.5"
          >
            <Bell className="h-3.5 w-3.5" />
            {CHARGES_MESSAGES.actions.invoiceNotification}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setNotificationTrigger('payment_reminder')}
            disabled={actionLoading}
            className="gap-1.5"
          >
            <Bell className="h-3.5 w-3.5" />
            {CHARGES_MESSAGES.actions.paymentReminder}
          </Button>
        </div>
        {canDeleteCharge(charge.available_actions) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsConfirmingDelete(true)}
            isLoading={isDeleting}
            disabled={isDeleting || actionLoading}
            className="gap-1.5 text-negative-600 border-negative-200 hover:bg-negative-50 shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {GLOBAL_UI_MESSAGES.actions.delete}
          </Button>
        )}
      </div>
    ) : undefined

  return (
    <>
      <ConfirmDialog
        open={isConfirmingCancel}
        title={CHARGES_MESSAGES.detail.cancelTitle}
        message={charge ? CHARGES_MESSAGES.detail.cancelMessage(charge.id) : CHARGES_MESSAGES.detail.cancelFallback}
        confirmLabel={CHARGES_MESSAGES.actions.cancelCharge}
        cancelLabel={CHARGES_MESSAGES.actions.back}
        isLoading={actionLoading}
        onConfirm={async () => {
          await runAction('cancel_charge', cancelReason || undefined)
          closeCancelDialog()
        }}
        onCancel={closeCancelDialog}
      >
        <Textarea
          className="mt-3 resize-none"
          rows={3}
          placeholder={CHARGE_CANCEL_REASON_PLACEHOLDER}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={isConfirmingDelete}
        title={CHARGES_MESSAGES.detail.deleteTitle}
        message={charge ? CHARGES_MESSAGES.detail.deleteMessage(charge.id) : CHARGES_MESSAGES.detail.deleteFallback}
        confirmLabel={CHARGES_MESSAGES.detail.deleteConfirm}
        cancelLabel={GLOBAL_UI_MESSAGES.actions.cancel}
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={async () => {
          try {
            await deleteCharge()
            setIsConfirmingDelete(false)
            onClose()
          } catch {
            setIsConfirmingDelete(false)
          }
        }}
        onCancel={() => setIsConfirmingDelete(false)}
      />

      <DetailDrawer
        open={chargeId !== null}
        title={charge ? CHARGES_MESSAGES.detail.title(charge.id) : CHARGES_MESSAGES.detail.fallbackTitle}
        subtitle={
          charge ? (
            <span className="inline-flex items-center gap-2 flex-wrap">
              <Link
                to={`/clients/${charge.client_record_id}`}
                className="text-primary-600 hover:underline"
                onClick={onClose}
              >
                {clientLabel}
              </Link>
              <StatusBadge status={charge.status} getLabel={getChargeStatusLabel} variantMap={chargeStatusVariants} />
            </span>
          ) : undefined
        }
        onClose={onClose}
        footer={footer}
      >
        {denied && <Alert variant="warning" message={CHARGES_ERROR_MESSAGES.permissions.detail} />}

        {charge && (
          <>
            <DrawerSection title={GLOBAL_UI_MESSAGES.common.details}>
              <DefinitionList
                layout="stacked"
                items={[
                  {
                    label: GLOBAL_UI_MESSAGES.common.client,
                    value: (
                      <Link
                        to={`/clients/${charge.client_record_id}`}
                        className="text-primary-600 hover:underline"
                        onClick={onClose}
                      >
                        {clientLabel}
                      </Link>
                    ),
                  },
                  { label: CHARGES_MESSAGES.detail.type, value: getChargeTypeLabel(charge.charge_type) },
                  ...(charge.amount != null
                    ? [
                        {
                          label: CHARGES_MESSAGES.detail.amount,
                          value: <span className="font-semibold text-gray-900">{getChargeAmountText(charge)}</span>,
                        },
                      ]
                    : []),
                  {
                    label: CHARGES_MESSAGES.detail.period,
                    value: getChargePeriodLabel(charge.period, charge.months_covered),
                  },
                  ...(charge.description
                    ? [{ label: CHARGES_MESSAGES.detail.description, value: charge.description }]
                    : []),
                  ...(charge.annual_report_id
                    ? [{ label: CHARGES_MESSAGES.detail.annualReport, value: `#${charge.annual_report_id}` }]
                    : []),
                  { label: CHARGES_MESSAGES.detail.created, value: formatDateTime(charge.created_at) },
                  ...(charge.updated_at
                    ? [{ label: CHARGES_MESSAGES.detail.updated, value: formatDateTime(charge.updated_at) }]
                    : []),
                  { label: CHARGES_MESSAGES.detail.issued, value: formatDateTime(charge.issued_at) },
                  { label: CHARGES_MESSAGES.detail.paid, value: formatDateTime(charge.paid_at) },
                  { label: CHARGES_MESSAGES.detail.canceled, value: formatDateTime(charge.canceled_at) },
                  ...(charge.cancellation_reason
                    ? [{ label: CHARGES_MESSAGES.detail.cancellationReason, value: charge.cancellation_reason }]
                    : []),
                ]}
              />
            </DrawerSection>

            <ChargeInvoiceSection chargeId={charge.id} chargeStatus={charge.status} canAttach={isAdvisor} />

            <EntityAuditTrailSection
              entityType="charge"
              entityId={charge.id}
              title={CHARGES_MESSAGES.detail.auditTitle}
              subtitle={CHARGES_MESSAGES.detail.auditSubtitle}
              compact
              fieldValueLabels={FIELD_VALUE_LABELS}
            />
          </>
        )}
      </DetailDrawer>
      {charge && notificationTrigger && (
        <SendNotificationModal
          open={notificationTrigger !== null}
          onClose={() => setNotificationTrigger(null)}
          clientRecordId={charge.client_record_id}
          initialTrigger={notificationTrigger}
          entityId={charge.id}
          disableTriggerChange
        />
      )}
    </>
  )
}
