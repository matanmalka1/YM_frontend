import { useState } from 'react'
import { Clock, Info } from 'lucide-react'
import { formatDate } from '@/utils/utils'
import { AlertBanner } from '@/components/ui/overlays/AlertBanner'
import { Badge } from '@/components/ui/primitives/Badge'
import { Card } from '@/components/ui/primitives/Card'
import { useVatWorkItemActions } from '../../hooks/useVatWorkItemActions'
import { useVatLifecyclePending } from '../../hooks/useVatLifecyclePending'
import { VAT_DEADLINE_WARNING_DAYS } from '../../constants/vatConstants'
import { VatProgressBar } from '../shared/VatProgressBar'
import { VatFiledBanner } from '../shared/VatFiledBanner'
import { VatActionButtons } from '../shared/VatActionButtons'
import { VatSendBackForm } from '../form/VatSendBackForm'
import { VatFileModal } from '../form/VatFileModal'
import { isFiled } from '../../utils/vatHelpers'
import type { VatWorkItemSummaryBarProps } from '../../types'
import { VAT_MESSAGES } from '../../messages'

export const VatWorkItemSummaryBar: React.FC<VatWorkItemSummaryBarProps> = ({ workItem, filedBanner }) => {
  const { handleMaterialsComplete, handleReadyForReview, handleSendBack } = useVatWorkItemActions(workItem.id)
  const isPending = useVatLifecyclePending(workItem.id)
  const [showSendBack, setShowSendBack] = useState(false)
  const [showFileModal, setShowFileModal] = useState(false)
  const filed = isFiled(workItem.status)

  return (
    <Card size="compact" disablePadding className="shadow-sm" bodyClassName="p-4 space-y-3">
      {filed && filedBanner && <VatFiledBanner {...filedBanner} />}

      {workItem.status === 'pending_materials' && workItem.pending_materials_note && (
        <AlertBanner tone="warning" icon={Info}>
          {workItem.pending_materials_note}
        </AlertBanner>
      )}

      {!filed && workItem.is_overdue && (workItem.extended_deadline ?? workItem.submission_deadline) && (
        <AlertBanner tone="negative">
          {VAT_MESSAGES.summary.overdueDeadline(formatDate(workItem.extended_deadline ?? workItem.submission_deadline))}
        </AlertBanner>
      )}

      {!filed &&
        !workItem.is_overdue &&
        workItem.days_until_deadline != null &&
        workItem.days_until_deadline <= VAT_DEADLINE_WARNING_DAYS && (
          <AlertBanner tone="warning" icon={Clock}>
            {VAT_MESSAGES.summary.daysRemaining(workItem.days_until_deadline)}
          </AlertBanner>
        )}

      {workItem.is_overridden && (
        <AlertBanner tone="warning">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning" size="xs" className="font-semibold">
              {VAT_MESSAGES.summary.overriddenAmount}
            </Badge>
            {workItem.override_justification && (
              <span className="text-warning-700">{workItem.override_justification}</span>
            )}
          </div>
        </AlertBanner>
      )}

      <VatProgressBar currentStatus={workItem.status} />

      {!filed && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
          {showSendBack ? (
            <div className="w-full">
              <p className="mb-2 text-sm font-medium text-warning-700">{VAT_MESSAGES.summary.sendBackNoteTitle}</p>
              <VatSendBackForm
                loading={isPending}
                onCancel={() => setShowSendBack(false)}
                onSubmit={async (note) => {
                  if (await handleSendBack(note)) setShowSendBack(false)
                }}
              />
            </div>
          ) : (
            <VatActionButtons
              workItem={workItem}
              isLoading={isPending}
              onMaterialsComplete={handleMaterialsComplete}
              onReadyForReview={handleReadyForReview}
              onFile={() => setShowFileModal(true)}
              onSendBack={() => setShowSendBack(true)}
            />
          )}
        </div>
      )}

      <VatFileModal open={showFileModal} workItemId={workItem.id} onClose={() => setShowFileModal(false)} />
    </Card>
  )
}

VatWorkItemSummaryBar.displayName = 'VatWorkItemSummaryBar'
