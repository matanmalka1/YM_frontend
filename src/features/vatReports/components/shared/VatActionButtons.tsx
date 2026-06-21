import { Send, RotateCcw, PackageCheck } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { canMarkMaterialsComplete, canMarkReadyForReview, canFile, canSendBack } from '../../utils/vatHelpers'
import { isClientClosed } from '@/utils/clientStatus'
import type { VatActionButtonsProps } from '../../types'

export const VatActionButtons: React.FC<VatActionButtonsProps> = ({
  workItem,
  isAdvisor,
  isLoading,
  disabled = false,
  onMaterialsComplete,
  onReadyForReview,
  onFile,
  onSendBack,
}) => {
  const actionsDisabled = isClientClosed(workItem.client_status) || disabled
  const actions = workItem.available_actions
  const showMaterialsComplete = canMarkMaterialsComplete(actions)
  const showReadyForReview = canMarkReadyForReview(actions)
  const showFile = isAdvisor && canFile(actions)
  const showSendBack = isAdvisor && canSendBack(actions)

  if (!showMaterialsComplete && !showReadyForReview && !showFile && !showSendBack) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showMaterialsComplete && (
        <Button
          variant="primary"
          size="sm"
          isLoading={isLoading}
          disabled={actionsDisabled}
          onClick={onMaterialsComplete}
        >
          <PackageCheck className="h-4 w-4" />
          אישור קבלת חומרים
        </Button>
      )}
      {showReadyForReview && (
        <Button variant="primary" size="sm" isLoading={isLoading} disabled={actionsDisabled} onClick={onReadyForReview}>
          <Send className="h-4 w-4" />
          שלח לבדיקה
        </Button>
      )}
      {showFile && (
        <Button variant="primary" size="sm" isLoading={isLoading} disabled={actionsDisabled} onClick={onFile}>
          <Send className="h-4 w-4" />
          הגש מע&quot;מ
        </Button>
      )}
      {showSendBack && (
        <Button
          variant="outline"
          size="sm"
          isLoading={isLoading}
          disabled={actionsDisabled}
          onClick={onSendBack}
          className="border-warning-200 bg-warning-50 text-warning-700 hover:bg-warning-100"
        >
          <RotateCcw className="h-4 w-4" />
          החזר לתיקון
        </Button>
      )}
    </div>
  )
}

VatActionButtons.displayName = 'VatActionButtons'
