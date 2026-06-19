import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, ChevronLeft, Clock, FolderOpen, Info, AlertTriangle, User } from 'lucide-react'
import { formatDate } from '@/utils/utils'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import { getVatWorkItemStatusLabel } from '../../constants/vatConstants'
import { useRole } from '@/hooks/useRole'
import { useVatWorkItemActions } from '../../hooks/useVatWorkItemActions'
import { useActiveVatBinder } from '../../hooks/useActiveVatBinder'
import { VAT_DEADLINE_WARNING_DAYS, VAT_STATUS_BADGE_VARIANTS } from '../../constants/vatConstants'
import { VatProgressBar } from '../shared/VatProgressBar'
import { VatActionButtons } from '../shared/VatActionButtons'
import { VatExportButtons } from '../shared/VatExportButtons'
import { VatSendBackForm } from '../form/VatSendBackForm'
import { VatFileModal } from '../form/VatFileModal'
import { isFiled } from '../../utils/vatHelpers'
import type { VatWorkItemSummaryBarProps } from '../../types'
import { formatVatPeriodTitle, getVatClientTitle } from '../../utils/viewHelpers'
import { SendNotificationModal } from '@/features/notifications'

type AlertTone = 'warning' | 'error'

const ALERT_CLASSES: Record<AlertTone, { wrap: string; icon: string; Icon: typeof AlertTriangle }> = {
  warning: {
    wrap: 'border-warning-200 bg-warning-50 text-warning-800',
    icon: 'text-warning-500',
    Icon: AlertTriangle,
  },
  error: {
    wrap: 'border-negative-200 bg-negative-50 text-negative-800',
    icon: 'text-negative-500',
    Icon: AlertTriangle,
  },
}

const AlertBanner: React.FC<{
  tone: AlertTone
  icon?: typeof AlertTriangle
  children: React.ReactNode
}> = ({ tone, icon: IconOverride, children }) => {
  const { wrap, icon, Icon } = ALERT_CLASSES[tone]
  const FinalIcon = IconOverride ?? Icon
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${wrap}`}>
      <FinalIcon className={`mt-0.5 h-4 w-4 shrink-0 ${icon}`} />
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
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const filed = isFiled(workItem.status)
  const { activeBinder } = useActiveVatBinder(workItem.client_record_id)
  const titleClient = getVatClientTitle(workItem.client_name, workItem.client_record_id)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1 text-xs">
            <Link to="/tax/vat" className="text-gray-400 hover:text-primary-600 transition-colors">
              דוחות מע&quot;מ
            </Link>
            <ChevronLeft className="h-3.5 w-3.5 text-gray-300" />
            <span className="text-gray-500">תיק תקופתי</span>
          </div>
          <h1 className="truncate text-xl font-bold text-gray-950">
            {titleClient}
            <span className="mx-2 font-normal text-gray-300">·</span>
            <span>{formatVatPeriodTitle(workItem.period, workItem.period_type)}</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {activeBinder && (
            <Link
              to={`/binders?binder_number=${activeBinder.binder_number}`}
              className="inline-flex items-center gap-1 rounded-full border border-info-200 bg-info-50 px-2.5 py-0.5 text-xs font-medium text-info-700 transition-colors hover:bg-info-100"
            >
              <FolderOpen className="h-3 w-3" />
              קלסר {activeBinder.binder_number}
            </Link>
          )}
          {workItem.assigned_to !== null && (
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              <User className="h-3 w-3" />
              <span className="text-gray-400">מטפל:</span>
              {workItem.assigned_to_name ?? `#${workItem.assigned_to}`}
            </span>
          )}
          <StatusBadge
            status={workItem.status}
            getLabel={getVatWorkItemStatusLabel}
            variantMap={VAT_STATUS_BADGE_VARIANTS}
          />
          {isAdvisor && <VatExportButtons clientId={workItem.client_record_id} period={workItem.period} />}
          {isAdvisor && (
            <Button variant="outline" size="sm" onClick={() => setShowNotificationModal(true)} className="gap-1.5">
              <Bell className="h-3.5 w-3.5" />
              תזכורת מסמכים
            </Button>
          )}
        </div>
      </div>

      {workItem.status === 'pending_materials' && workItem.pending_materials_note && (
        <AlertBanner tone="warning" icon={Info}>
          {workItem.pending_materials_note}
        </AlertBanner>
      )}

      {workItem.is_overdue && (workItem.extended_deadline ?? workItem.submission_deadline) && (
        <AlertBanner tone="error">
          תאריך הגשה חלף — {formatDate(workItem.extended_deadline ?? workItem.submission_deadline)}
        </AlertBanner>
      )}

      {!workItem.is_overdue &&
        workItem.days_until_deadline != null &&
        workItem.days_until_deadline <= VAT_DEADLINE_WARNING_DAYS && (
          <AlertBanner tone="warning" icon={Clock}>
            נותרו {workItem.days_until_deadline} ימים להגשה
          </AlertBanner>
        )}

      {workItem.is_overridden && (
        <AlertBanner tone="warning">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning" size="xs" className="font-semibold">
              סכום מע&quot;מ עוקף
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
              <p className="mb-2 text-sm font-medium text-warning-700">הוספת הערה לתיקון</p>
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
      <SendNotificationModal
        open={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        clientRecordId={workItem.client_record_id}
        initialTrigger="vat_documents_reminder"
        entityId={workItem.id}
        disableTriggerChange
      />
    </div>
  )
}

VatWorkItemSummaryBar.displayName = 'VatWorkItemSummaryBar'
