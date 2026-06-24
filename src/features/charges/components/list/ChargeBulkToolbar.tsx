import { useState } from 'react'
import { BulkSelectionActionButton, BulkSelectionToolbar } from '@/components/ui/table/BulkSelectionToolbar'
import { Textarea } from '@/components/ui/inputs/Textarea'
import { Button } from '@/components/ui/primitives/Button'
import type { BulkChargeActionPayload } from '../../api'
import { CHARGE_CANCEL_REASON_PLACEHOLDER } from '../../constants'
import { CHARGES_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface ChargeBulkToolbarProps {
  selectedCount: number
  loading: boolean
  onAction: (action: BulkChargeActionPayload['action'], cancellationReason?: string) => Promise<void>
  onClear: () => void
}

export const ChargeBulkToolbar: React.FC<ChargeBulkToolbarProps> = ({ selectedCount, loading, onAction, onClear }) => {
  const [showCancelInput, setShowCancelInput] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const handleCancel = async () => {
    await onAction('cancel', cancelReason || undefined)
    setShowCancelInput(false)
    setCancelReason('')
  }

  return (
    <BulkSelectionToolbar
      selectedCount={selectedCount}
      loading={loading}
      onClear={onClear}
      extra={
        showCancelInput ? (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Textarea
                size="sm"
                nonResizable
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={CHARGE_CANCEL_REASON_PLACEHOLDER}
                aria-label={CHARGE_CANCEL_REASON_PLACEHOLDER}
                rows={1}
              />
            </div>
            <BulkSelectionActionButton
              label={CHARGES_MESSAGES.actions.confirmCancel}
              disabled={loading}
              loading={loading}
              variant="danger"
              onClick={() => void handleCancel()}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCancelInput(false)
                setCancelReason('')
              }}
              className="text-xs text-gray-500 hover:text-gray-700 px-2"
            >
              {CHARGES_MESSAGES.actions.back}
            </Button>
          </div>
        ) : null
      }
    >
      <BulkSelectionActionButton
        label={CHARGES_MESSAGES.actions.issueBulk}
        disabled={loading}
        loading={loading}
        onClick={() => void onAction('issue')}
      />
      <BulkSelectionActionButton
        label={CHARGES_MESSAGES.actions.markPaidBulk}
        disabled={loading}
        loading={loading}
        onClick={() => void onAction('mark-paid')}
      />
      <BulkSelectionActionButton
        label={GLOBAL_UI_MESSAGES.actions.cancel}
        disabled={loading}
        loading={loading}
        variant="danger"
        onClick={() => setShowCancelInput((value) => !value)}
      />
    </BulkSelectionToolbar>
  )
}
