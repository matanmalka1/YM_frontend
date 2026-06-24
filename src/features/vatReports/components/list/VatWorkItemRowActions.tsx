import { PackageCheck, SendHorizontal, Trash2 } from 'lucide-react'
import { RowActionGroup, RowActionItem, RowActionsMenu } from '@/components/ui/table'
import { canMarkMaterialsComplete, canMarkReadyForReview, isFiled } from '../../utils/vatHelpers'
import type { VatWorkItemRowActionsProps } from '../../types'
import { VAT_MESSAGES } from '../../messages'

export const VatWorkItemRowActions: React.FC<VatWorkItemRowActionsProps> = ({
  item,
  isLoading,
  isDisabled,
  runAction,
  canDelete,
  isDeleting,
  onDeleteRequest,
}) => {
  const canComplete = canMarkMaterialsComplete(item.available_actions)
  const canReview = canMarkReadyForReview(item.available_actions)
  const hasAny = canComplete || canReview

  if (isFiled(item.status)) {
    return <span className="text-xs text-gray-400">{VAT_MESSAGES.rowActions.filed}</span>
  }

  if (!hasAny && !canDelete) return null

  return (
    <RowActionsMenu ariaLabel={VAT_MESSAGES.rowActions.ariaLabel(item.id)}>
      <RowActionGroup>
        {canComplete && (
          <RowActionItem
            label={VAT_MESSAGES.actions.confirmMaterialsReceived}
            onClick={() => void runAction(item.id, 'materialsComplete')}
            icon={<PackageCheck className="h-4 w-4" />}
            disabled={isLoading || isDisabled}
          />
        )}
        {canReview && (
          <RowActionItem
            label={VAT_MESSAGES.actions.readyForReview}
            onClick={() => void runAction(item.id, 'readyForReview')}
            icon={<SendHorizontal className="h-4 w-4" />}
            disabled={isLoading || isDisabled}
          />
        )}
      </RowActionGroup>
      <RowActionGroup>
        {canDelete && (
          <RowActionItem
            label={VAT_MESSAGES.actions.deleteWorkItem}
            onClick={() => onDeleteRequest(item)}
            icon={<Trash2 className="h-4 w-4" />}
            disabled={isLoading || isDisabled || isDeleting}
            danger
          />
        )}
      </RowActionGroup>
    </RowActionsMenu>
  )
}

VatWorkItemRowActions.displayName = 'VatWorkItemRowActions'
