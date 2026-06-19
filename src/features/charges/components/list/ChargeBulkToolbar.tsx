import { useState } from 'react'
import { BulkSelectionActionButton, BulkSelectionToolbar } from '@/components/ui/table/BulkSelectionToolbar'
import { Button } from '@/components/ui/primitives/Button'
import type { BulkChargeActionPayload } from '../../api'
import { CHARGE_CANCEL_REASON_PLACEHOLDER } from '../../constants'

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
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={CHARGE_CANCEL_REASON_PLACEHOLDER}
              rows={1}
              className="flex-1 resize-none rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
            <BulkSelectionActionButton
              label="אשר ביטול"
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
              חזור
            </Button>
          </div>
        ) : null
      }
    >
      <BulkSelectionActionButton
        label="הנפק"
        disabled={loading}
        loading={loading}
        onClick={() => void onAction('issue')}
      />
      <BulkSelectionActionButton
        label="סמן כשולם"
        disabled={loading}
        loading={loading}
        onClick={() => void onAction('mark-paid')}
      />
      <BulkSelectionActionButton
        label="בטל"
        disabled={loading}
        loading={loading}
        variant="danger"
        onClick={() => setShowCancelInput((value) => !value)}
      />
    </BulkSelectionToolbar>
  )
}
