import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { PageHeader, type Breadcrumb } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/overlays/Alert'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Button } from '@/components/ui/primitives/Button'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import type { AdvancePaymentRow, UpdateAdvancePaymentPayload } from '../../api/contracts'
import { ADVANCE_PAYMENT_STATUS_VARIANTS, getAdvancePaymentStatusLabel } from '../../constants'
import { useAdvancePaymentDetailForm } from '../../hooks/useAdvancePaymentDetailForm'
import { toEditableAmount } from '../../utils/advancePaymentComponentUtils'
import { AdvancePaymentContextCard } from './AdvancePaymentContextCard'
import { AdvancePaymentEditableSections } from './AdvancePaymentEditableSections'
import { AdvancePaymentReadonlySections } from './AdvancePaymentReadonlySections'
import { AdvancePaymentSummaryStrip } from './AdvancePaymentSummaryStrip'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentDetailViewProps {
  payment: AdvancePaymentRow
  title: string
  description?: string
  breadcrumbs: Breadcrumb[]
  clientIdNumber?: string | null
  canEdit: boolean
  isUpdating: boolean
  isDeleting: boolean
  onSave: (payload: UpdateAdvancePaymentPayload) => Promise<void>
  onDelete?: () => Promise<void>
  turnoverRefresh: {
    isRefreshing: boolean
    onRefresh: () => Promise<AdvancePaymentRow | undefined>
    isConfirmingPending: boolean
    onConfirmPending: () => Promise<AdvancePaymentRow | undefined>
    onCancelPending: () => void
  }
}

/**
 * Full-page view of one advance payment. Mounted keyed by payment id, so the
 * edit form seeds itself once per payment and refetches never wipe in-progress
 * edits.
 */
export const AdvancePaymentDetailView: React.FC<AdvancePaymentDetailViewProps> = ({
  payment,
  title,
  description,
  breadcrumbs,
  clientIdNumber,
  canEdit,
  isUpdating,
  isDeleting,
  onSave,
  onDelete,
  turnoverRefresh,
}) => {
  const form = useAdvancePaymentDetailForm({ payment, onSave })
  const [confirmDelete, setConfirmDelete] = useState(false)

  // A snapshot rewrites the turnover server-side; the seeded input must follow,
  // or the next save would send the stale pre-snapshot value and wipe it.
  const handleRefreshTurnover = async () => {
    const refreshed = await turnoverRefresh.onRefresh()
    if (refreshed) form.setTurnoverAmount(toEditableAmount(refreshed.turnover_amount))
  }
  const handleConfirmPendingRefresh = async () => {
    const refreshed = await turnoverRefresh.onConfirmPending()
    if (refreshed) form.setTurnoverAmount(toEditableAmount(refreshed.turnover_amount))
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span>{title}</span>
            <StatusBadge
              status={payment.status}
              getLabel={getAdvancePaymentStatusLabel}
              variantMap={ADVANCE_PAYMENT_STATUS_VARIANTS}
              size="sm"
            />
          </span>
        }
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          canEdit ? (
            <>
              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setConfirmDelete(true)}
                  disabled={isUpdating || isDeleting}
                  aria-label={ADVANCED_PAYMENTS_MESSAGES.detailActions.deleteAriaLabel}
                >
                  {ADVANCED_PAYMENTS_MESSAGES.detailActions.deleteTitle}
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                isLoading={isUpdating}
                onClick={form.handleSave}
                disabled={!form.isDirty || isUpdating || isDeleting}
              >
                {GLOBAL_UI_MESSAGES.actions.save}
              </Button>
            </>
          ) : undefined
        }
      />

      {form.isDirty && (
        <Alert variant="info" size="sm" message={ADVANCED_PAYMENTS_MESSAGES.detail.unsavedChangesNotice} />
      )}

      {payment.missing_turnover && (
        <Alert variant="warning" size="sm" message={ADVANCED_PAYMENTS_MESSAGES.detail.missingTurnoverAlert} />
      )}

      <AdvancePaymentSummaryStrip payment={payment} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {canEdit ? (
            <AdvancePaymentEditableSections
              form={form}
              payment={payment}
              isRefreshingTurnover={turnoverRefresh.isRefreshing}
              onRefreshTurnover={handleRefreshTurnover}
            />
          ) : (
            <AdvancePaymentReadonlySections payment={payment} />
          )}
        </div>

        <AdvancePaymentContextCard payment={payment} clientIdNumber={clientIdNumber} />
      </div>

      <ConfirmDialog
        open={turnoverRefresh.isConfirmingPending}
        title={ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.confirmTitle}
        message={ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.confirmMessage}
        confirmLabel={ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.confirmLabel}
        isLoading={turnoverRefresh.isRefreshing}
        onConfirm={handleConfirmPendingRefresh}
        onCancel={turnoverRefresh.onCancelPending}
      />

      {onDelete && (
        <ConfirmDialog
          open={confirmDelete}
          title={ADVANCED_PAYMENTS_MESSAGES.detailActions.deleteModalTitle}
          message={ADVANCED_PAYMENTS_MESSAGES.detailActions.deleteModalMessage}
          confirmLabel={ADVANCED_PAYMENTS_MESSAGES.detailActions.deleteConfirm}
          confirmVariant="danger"
          isLoading={isDeleting}
          onConfirm={onDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}

AdvancePaymentDetailView.displayName = 'AdvancePaymentDetailView'
