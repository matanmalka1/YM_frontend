import { useState } from 'react'
import { Bell, ReceiptText, Trash2, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Breadcrumb } from '@/components/layout/PageHeader'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/primitives/Card'
import { Button } from '@/components/ui/primitives/Button'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import { DefinitionList } from '@/components/ui/layout/DefinitionList'
import { PageLoading } from '@/components/ui/layout/PageLoading'
import { Alert } from '@/components/ui/overlays/Alert'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Textarea } from '@/components/ui/inputs/Textarea'
import { EntityAuditTrailSection, type FieldValueLabels } from '@/features/audit'
import { ChargeInvoiceSection } from '@/features/invoices'
import { SendNotificationModal, type NotificationTrigger } from '@/features/notifications'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { formatDateTime } from '@/utils/utils'
import {
  CHARGE_CANCEL_REASON_PLACEHOLDER,
  CHARGE_STATUS_LABELS,
  CHARGE_TYPE_LABELS,
  chargeStatusVariants,
  getChargeStatusLabel,
  getChargeTypeLabel,
} from '../../constants'
import { CHARGES_ERROR_MESSAGES } from '../../errorMessages'
import { useChargeDetailsPage } from '../../hooks/useChargeDetailsPage'
import { CHARGES_MESSAGES } from '../../messages'
import { canDeleteCharge, getChargeAmountText, getChargeClientLabel, getChargePeriodLabel } from '../../utils/chargeUtils'
import { ChargeEditModal } from '../form/ChargeEditModal'
import { ChargeActionButtons } from './ChargeActionButtons'

const FIELD_VALUE_LABELS: FieldValueLabels = {
  status: CHARGE_STATUS_LABELS,
  charge_type: CHARGE_TYPE_LABELS,
}

interface ChargeDetailPanelProps {
  chargeId: number
  leadingBreadcrumbs: Breadcrumb[]
  onDeleted: () => void
}

export const ChargeDetailPanel = ({ chargeId, leadingBreadcrumbs, onDeleted }: ChargeDetailPanelProps) => {
  const {
    actionLoading,
    charge,
    denied,
    error,
    isLoading,
    runAction,
    isAdvisor,
    deleteCharge,
    isDeleting,
    updateCharge,
    isUpdating,
    updateError,
  } = useChargeDetailsPage(String(chargeId))
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [notificationTrigger, setNotificationTrigger] = useState<NotificationTrigger | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  if (isLoading) return <PageLoading />
  if (error || !charge) return <Alert variant="error" message={error ?? CHARGES_ERROR_MESSAGES.detail.load} />

  const clientLabel = getChargeClientLabel(charge)
  const closeCancelDialog = () => {
    setIsConfirmingCancel(false)
    setCancelReason('')
  }
  const details = [
    { label: CHARGES_MESSAGES.detail.type, value: getChargeTypeLabel(charge.charge_type) },
    { label: CHARGES_MESSAGES.detail.period, value: getChargePeriodLabel(charge.period, charge.months_covered) },
    ...(charge.description ? [{ label: CHARGES_MESSAGES.detail.description, value: charge.description }] : []),
    ...(charge.annual_report_id ? [{ label: CHARGES_MESSAGES.detail.annualReport, value: `#${charge.annual_report_id}` }] : []),
    ...(charge.cancellation_reason
      ? [{ label: CHARGES_MESSAGES.detail.cancellationReason, value: charge.cancellation_reason }]
      : []),
  ]
  const dates = [
    { label: CHARGES_MESSAGES.detail.created, value: formatDateTime(charge.created_at) },
    ...(charge.updated_at ? [{ label: CHARGES_MESSAGES.detail.updated, value: formatDateTime(charge.updated_at) }] : []),
    { label: CHARGES_MESSAGES.detail.issued, value: formatDateTime(charge.issued_at) },
    { label: CHARGES_MESSAGES.detail.paid, value: formatDateTime(charge.paid_at) },
    { label: CHARGES_MESSAGES.detail.canceled, value: formatDateTime(charge.canceled_at) },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title={CHARGES_MESSAGES.detail.title(charge.id)}
        description={clientLabel}
        breadcrumbs={[...leadingBreadcrumbs, { label: CHARGES_MESSAGES.detail.title(charge.id) }]}
      />

      {denied && <Alert variant="warning" message={CHARGES_ERROR_MESSAGES.permissions.detail} />}

      <Card
        variant="outlined"
        size="compact"
        radius="xl"
        bodyClassName="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <ReceiptText className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-bold tabular-nums text-gray-950">{getChargeAmountText(charge)}</p>
              <StatusBadge status={charge.status} getLabel={getChargeStatusLabel} variantMap={chargeStatusVariants} />
            </div>
            <Link
              to={`/clients/${charge.client_record_id}`}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary-700 hover:underline"
            >
              <UserRound className="h-4 w-4" />
              {clientLabel}
            </Link>
          </div>
        </div>
        {isAdvisor && (
          <ChargeActionButtons
            actions={charge.available_actions ?? []}
            disabled={actionLoading}
            onIssue={() => void runAction('issue_charge')}
            onMarkPaid={() => void runAction('mark_paid')}
            onCancel={() => setIsConfirmingCancel(true)}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]">
        <div className="space-y-5">
          <Card title={GLOBAL_UI_MESSAGES.common.details} variant="outlined" size="compact" radius="xl">
            <DefinitionList items={details} columns={2} />
          </Card>
          <Card variant="outlined" size="compact" radius="xl">
            <ChargeInvoiceSection chargeId={charge.id} chargeStatus={charge.status} canAttach={isAdvisor} />
          </Card>
          <EntityAuditTrailSection
            entityType="charge"
            entityId={charge.id}
            title={CHARGES_MESSAGES.detail.auditTitle}
            subtitle={CHARGES_MESSAGES.detail.auditSubtitle}
            compact
            fieldValueLabels={FIELD_VALUE_LABELS}
          />
        </div>
        <div className="space-y-5">
          <Card title="מועדים" variant="outlined" size="compact" radius="xl">
            <DefinitionList layout="stacked" items={dates} />
          </Card>
          {isAdvisor && (
            <Card title="שליחת הודעה" variant="outlined" size="compact" radius="xl" bodyClassName="space-y-2">
              <Button
                className="w-full justify-center"
                variant="outline"
                icon={<Bell className="h-4 w-4" />}
                onClick={() => setNotificationTrigger('invoice_issued')}
              >
                {CHARGES_MESSAGES.actions.invoiceNotification}
              </Button>
              <Button
                className="w-full justify-center"
                variant="outline"
                icon={<Bell className="h-4 w-4" />}
                onClick={() => setNotificationTrigger('payment_reminder')}
              >
                {CHARGES_MESSAGES.actions.paymentReminder}
              </Button>
            </Card>
          )}
          {isAdvisor && canDeleteCharge(charge.available_actions) && (
            <Card variant="outlined" size="compact" radius="xl">
              <Button
                className="w-full justify-center"
                variant="danger"
                icon={<Trash2 className="h-4 w-4" />}
                isLoading={isDeleting}
                onClick={() => setIsConfirmingDelete(true)}
              >
                {GLOBAL_UI_MESSAGES.actions.delete}
              </Button>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmingCancel}
        title={CHARGES_MESSAGES.detail.cancelTitle}
        message={CHARGES_MESSAGES.detail.cancelMessage(charge.id)}
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
          onChange={(event) => setCancelReason(event.target.value)}
        />
      </ConfirmDialog>
      <ConfirmDialog
        open={isConfirmingDelete}
        title={CHARGES_MESSAGES.detail.deleteTitle}
        message={CHARGES_MESSAGES.detail.deleteMessage(charge.id)}
        confirmLabel={CHARGES_MESSAGES.detail.deleteConfirm}
        cancelLabel={GLOBAL_UI_MESSAGES.actions.cancel}
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={async () => {
          try {
            await deleteCharge()
            setIsConfirmingDelete(false)
            onDeleted()
          } catch {
            setIsConfirmingDelete(false)
          }
        }}
        onCancel={() => setIsConfirmingDelete(false)}
      />
      {isEditing && (
        <ChargeEditModal
          open
          charge={charge}
          updateError={updateError}
          updateLoading={isUpdating}
          onClose={() => setIsEditing(false)}
          onSubmit={updateCharge}
        />
      )}
      {notificationTrigger && (
        <SendNotificationModal
          open
          onClose={() => setNotificationTrigger(null)}
          clientRecordId={charge.client_record_id}
          initialTrigger={notificationTrigger}
          entityId={charge.id}
          disableTriggerChange
        />
      )}
    </div>
  )
}

ChargeDetailPanel.displayName = 'ChargeDetailPanel'
