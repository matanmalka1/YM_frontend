import { useState } from 'react'
import { Clock, Info, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/utils/utils'
import { Badge } from '@/components/ui/primitives/Badge'
import { Card } from '@/components/ui/primitives/Card'
import { useRole } from '@/hooks/useRole'
import { useVatWorkItemActions } from '../../hooks/useVatWorkItemActions'
import { VAT_DEADLINE_WARNING_DAYS } from '../../constants/vatConstants'
import { VatProgressBar } from '../shared/VatProgressBar'
import { VatActionButtons } from '../shared/VatActionButtons'
import { VatSendBackForm } from '../form/VatSendBackForm'
import { VatFileModal } from '../form/VatFileModal'
import { isFiled } from '../../utils/vatHelpers'
import type { VatWorkItemSummaryBarProps } from '../../types'
import { VAT_MESSAGES } from '../../messages'

type AlertTone = 'warning' | 'negative'

const ALERT_CLASSES: Record<AlertTone, { wrap: string; Icon: typeof AlertTriangle }> = {
  warning: { wrap: 'border-warning-200 bg-warning-50 text-warning-800', Icon: AlertTriangle },
  negative: { wrap: 'border-negative-200 bg-negative-50 text-negative-800', Icon: AlertTriangle },
}

const AlertBanner: React.FC<{
  tone: AlertTone
  icon?: typeof AlertTriangle
  children: React.ReactNode
}> = ({ tone, icon: IconOverride, children }) => {
  const { wrap, Icon } = ALERT_CLASSES[tone]
  const FinalIcon = IconOverride ?? Icon
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${wrap}`}>
      <FinalIcon className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
      <span>{children}</span>
    </div>
  )
}

export const VatWorkItemSummaryBar: React.FC<VatWorkItemSummaryBarProps> = ({ workItem, onFilingPendingChange }) => {
  const { isAdvisor } = useRole()
  const { handleMaterialsComplete, handleReadyForReview, handleSendBack, isLoading, isCoolingDown } =
    useVatWorkItemActions(workItem.id)
  const [showSendBack, setShowSendBack] = useState(false)
  const [showFileModal, setShowFileModal] = useState(false)
  const filed = isFiled(workItem.status)

  return (
    <Card size="compact" disablePadding className="shadow-sm" bodyClassName="p-4 space-y-3">
      {workItem.status === 'pending_materials' && workItem.pending_materials_note && (
        <AlertBanner tone="warning" icon={Info}>
          {workItem.pending_materials_note}
        </AlertBanner>
      )}

      {workItem.is_overdue && (workItem.extended_deadline ?? workItem.submission_deadline) && (
        <AlertBanner tone="negative">
          {VAT_MESSAGES.summary.overdueDeadline(formatDate(workItem.extended_deadline ?? workItem.submission_deadline))}
        </AlertBanner>
      )}

      {!workItem.is_overdue &&
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
                loading={isLoading}
                onCancel={() => setShowSendBack(false)}
                onSubmit={async (note) => {
                  await handleSendBack(note)
                  setShowSendBack(false)
                }}
              />
            </div>
          ) : (
            <VatActionButtons
              workItem={workItem}
              isAdvisor={isAdvisor}
              isLoading={isLoading}
              disabled={isCoolingDown}
              onMaterialsComplete={handleMaterialsComplete}
              onReadyForReview={handleReadyForReview}
              onFile={() => setShowFileModal(true)}
              onSendBack={() => setShowSendBack(true)}
            />
          )}
        </div>
      )}

      <VatFileModal
        open={showFileModal}
        workItemId={workItem.id}
        onClose={() => setShowFileModal(false)}
        onFilingStart={() => onFilingPendingChange?.(true)}
        onFilingEnd={() => onFilingPendingChange?.(false)}
      />
    </Card>
  )
}

VatWorkItemSummaryBar.displayName = 'VatWorkItemSummaryBar'
