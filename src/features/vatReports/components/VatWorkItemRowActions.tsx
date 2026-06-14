import { useState } from 'react'
import { PackageCheck, SendHorizontal, Trash2 } from 'lucide-react'
import { RowActionItem, RowActionSeparator, RowActionsMenu } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { useRole } from '../../../hooks/useRole'
import { canMarkMaterialsComplete, canMarkReadyForReview, isFiled } from '../utils'
import { useDeleteWorkItem } from '../hooks/useVatInvoiceMutations'
import type { VatWorkItemRowActionsProps } from '../types'

export const VatWorkItemRowActions: React.FC<VatWorkItemRowActionsProps> = ({
  item,
  isLoading,
  isDisabled,
  runAction,
}) => {
  const { isAdvisor, isSecretary } = useRole()
  const { deleteWorkItem, isDeleting } = useDeleteWorkItem()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const canDelete = (isAdvisor || isSecretary) && !isFiled(item.status)
  const hasAny = canMarkMaterialsComplete(item.available_actions) || canMarkReadyForReview(item.available_actions)

  if (isFiled(item.status)) {
    return <span className="text-xs text-gray-400">הוגש</span>
  }

  if (!hasAny && !canDelete) return null

  return (
    <>
      <RowActionsMenu ariaLabel={`פעולות לפריט ${item.id}`}>
        {canMarkMaterialsComplete(item.available_actions) && (
          <RowActionItem
            label="אשר קבלת חומרים"
            onClick={() => void runAction(item.id, 'materialsComplete')}
            icon={<PackageCheck className="h-4 w-4" />}
            disabled={isLoading || isDisabled}
          />
        )}
        {canMarkReadyForReview(item.available_actions) && (
          <RowActionItem
            label="שלח לבדיקה"
            onClick={() => void runAction(item.id, 'readyForReview')}
            icon={<SendHorizontal className="h-4 w-4" />}
            disabled={isLoading || isDisabled}
          />
        )}
        {canDelete && (
          <>
            <RowActionSeparator />
            <RowActionItem
              label="מחק תיק"
              onClick={() => setConfirmOpen(true)}
              icon={<Trash2 className="h-4 w-4" />}
              disabled={isLoading || isDisabled || isDeleting}
              danger
            />
          </>
        )}
      </RowActionsMenu>
      {canDelete && (
        <ConfirmDialog
          open={confirmOpen}
          title='מחיקת תיק מע"מ'
          message="האם למחוק את התיק? פעולה זו אינה הפיכה."
          confirmLabel="מחק"
          cancelLabel="ביטול"
          confirmVariant="danger"
          isLoading={isDeleting}
          onConfirm={async () => {
            const ok = await deleteWorkItem(item.id)
            if (ok) setConfirmOpen(false)
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  )
}

VatWorkItemRowActions.displayName = 'VatWorkItemRowActions'
