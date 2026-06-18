import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'

interface AdvancePaymentDrawerFooterProps {
  rowId: number
  isUpdating: boolean
  isDeleting: boolean
  onClose: () => void
  onSave: () => Promise<void>
  onDelete?: (id: number) => Promise<void>
}

export const AdvancePaymentDrawerFooter: React.FC<AdvancePaymentDrawerFooterProps> = ({
  rowId,
  isUpdating,
  isDeleting,
  onClose,
  onSave,
  onDelete,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="flex w-full items-center justify-between gap-2">
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-error-600 hover:bg-error-50"
          onClick={() => setConfirmDelete(true)}
          disabled={isUpdating || isDeleting}
          aria-label="מחק מקדמה"
          title="מחק מקדמה"
        >
          <Trash2 size={14} />
        </Button>
      )}
      <div className="flex gap-2 ms-auto">
        <Button variant="outline" onClick={onClose} disabled={isUpdating || isDeleting}>
          ביטול
        </Button>
        <Button variant="primary" isLoading={isUpdating} onClick={onSave} disabled={isUpdating || isDeleting}>
          שמור
        </Button>
      </div>

      {onDelete && (
        <ConfirmDialog
          open={confirmDelete}
          title="מחיקת מקדמה"
          message="האם למחוק מקדמה זו?"
          confirmLabel="כן, מחק"
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
