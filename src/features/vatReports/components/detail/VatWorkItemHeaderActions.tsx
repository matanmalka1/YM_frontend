import { useState } from 'react'
import { Bell } from 'lucide-react'
import { SendNotificationModal } from '@/features/notifications'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/primitives/Button'
import { VatExportButtons } from '../shared/VatExportButtons'
import type { VatWorkItemResponse } from '../../api'
import { VAT_MESSAGES } from '../../messages'

interface VatWorkItemHeaderActionsProps {
  workItem: VatWorkItemResponse
}

export const VatWorkItemHeaderActions: React.FC<VatWorkItemHeaderActionsProps> = ({ workItem }) => {
  const { isAdvisor } = useRole()
  const [showNotificationModal, setShowNotificationModal] = useState(false)

  if (!isAdvisor) return null

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <VatExportButtons clientId={workItem.client_record_id} period={workItem.period} />
        <Button
          variant="outline"
          size="sm"
          icon={<Bell className="h-3.5 w-3.5" />}
          onClick={() => setShowNotificationModal(true)}
        >
          {VAT_MESSAGES.actions.documentsReminder}
        </Button>
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
