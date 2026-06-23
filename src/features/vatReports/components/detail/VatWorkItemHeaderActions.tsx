import { useState } from 'react'
import { Bell, FolderOpen, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SendNotificationModal } from '@/features/notifications'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/primitives/Button'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import { useActiveVatBinder } from '../../hooks/useActiveVatBinder'
import { getVatWorkItemStatusLabel, VAT_STATUS_BADGE_VARIANTS } from '../../constants/vatConstants'
import { VatExportButtons } from '../shared/VatExportButtons'
import type { VatWorkItemResponse } from '../../api'

interface VatWorkItemHeaderActionsProps {
  workItem: VatWorkItemResponse
}

export const VatWorkItemHeaderActions: React.FC<VatWorkItemHeaderActionsProps> = ({ workItem }) => {
  const { isAdvisor } = useRole()
  const { activeBinder } = useActiveVatBinder(workItem.client_record_id)
  const [showNotificationModal, setShowNotificationModal] = useState(false)

  return (
    <>
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
          <Button
            variant="outline"
            size="sm"
            icon={<Bell className="h-3.5 w-3.5" />}
            onClick={() => setShowNotificationModal(true)}
          >
            תזכורת מסמכים
          </Button>
        )}
      </div>
      <SendNotificationModal
        open={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        clientRecordId={workItem.client_record_id}
        initialTrigger="vat_documents_reminder"
        entityId={workItem.id}
        disableTriggerChange
      />
    </>
  )
}
