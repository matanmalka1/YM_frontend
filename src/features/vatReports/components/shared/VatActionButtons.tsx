import { Send, RotateCcw, PackageCheck } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { canMarkMaterialsComplete, canMarkReadyForReview, canFile, canSendBack } from '../../utils/vatHelpers'
import { isClientClosed } from '@/utils/clientStatus'
import type { VatActionButtonsProps } from '../../types'
import { VAT_MESSAGES } from '../../messages'

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
          icon={<PackageCheck className="h-4 w-4" />}
          isLoading={isLoading}
          disabled={actionsDisabled}
          onClick={onMaterialsComplete}
        >
          {VAT_MESSAGES.actions.materialsComplete}
        </Button>
      )}
      {showReadyForReview && (
        <Button
          variant="primary"
          size="sm"
          icon={<Send className="h-4 w-4" />}
          isLoading={isLoading}
          disabled={actionsDisabled}
          onClick={onReadyForReview}
        >
          {VAT_MESSAGES.actions.readyForReview}
        </Button>
      )}
      {showFile && (
        <Button
          variant="primary"
          size="sm"
          icon={<Send className="h-4 w-4" />}
          isLoading={isLoading}
          disabled={actionsDisabled}
          onClick={onFile}
        >
          {VAT_MESSAGES.actions.fileVat}
        </Button>
      )}
      {showSendBack && (
        <Button
          variant="outline"
          size="sm"
          icon={<RotateCcw className="h-4 w-4" />}
          isLoading={isLoading}
          disabled={actionsDisabled}
          onClick={onSendBack}
          className="border-warning-200 bg-warning-50 text-warning-700 hover:bg-warning-100"
        >
          {VAT_MESSAGES.actions.sendBack}
        </Button>
      )}
    </div>
  )
}

VatActionButtons.displayName = 'VatActionButtons'
