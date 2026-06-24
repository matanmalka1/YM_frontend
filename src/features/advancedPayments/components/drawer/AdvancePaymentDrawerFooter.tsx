import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { useOverlayDismiss } from '@/components/ui/overlays/useOverlayDismiss'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface AdvancePaymentDrawerFooterProps {
  rowId: number
  isUpdating: boolean
  isDeleting: boolean
  onSave: () => Promise<void>
  onDelete?: (id: number) => Promise<void>
}

export const AdvancePaymentDrawerFooter: React.FC<AdvancePaymentDrawerFooterProps> = ({
  rowId,
  isUpdating,
  isDeleting,
  onSave,
  onDelete,
}) => {
  const dismiss = useOverlayDismiss()
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="flex w-full items-center justify-between gap-2">
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-negative-600 hover:bg-negative-50"
          onClick={() => setConfirmDelete(true)}
          disabled={isUpdating || isDeleting}
          aria-label={ADVANCED_PAYMENTS_MESSAGES.drawerFooter.deleteAriaLabel}
          title={ADVANCED_PAYMENTS_MESSAGES.drawerFooter.deleteTitle}
        >
          <Trash2 size={14} />
        </Button>
      )}
      <div className="flex gap-2 ms-auto">
        <Button variant="outline" onClick={dismiss} disabled={isUpdating || isDeleting}>
          {GLOBAL_UI_MESSAGES.actions.cancel}
        </Button>
        <Button variant="primary" isLoading={isUpdating} onClick={onSave} disabled={isUpdating || isDeleting}>
          {ADVANCED_PAYMENTS_MESSAGES.drawerFooter.save}
        </Button>
      </div>

      {onDelete && (
        <ConfirmDialog
          open={confirmDelete}
          title={ADVANCED_PAYMENTS_MESSAGES.drawerFooter.deleteModalTitle}
          message={ADVANCED_PAYMENTS_MESSAGES.drawerFooter.deleteModalMessage}
          confirmLabel={ADVANCED_PAYMENTS_MESSAGES.drawerFooter.deleteConfirm}
          confirmVariant="danger"
          isLoading={isDeleting}
          onConfirm={async () => {
            await onDelete(rowId)
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}

AdvancePaymentDrawerFooter.displayName = 'AdvancePaymentDrawerFooter'
