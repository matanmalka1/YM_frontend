import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '../../../../components/ui/primitives/Button'

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
      {onDelete &&
        (confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-error-600">למחוק?</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-error-600 hover:bg-error-50"
              isLoading={isDeleting}
              onClick={async () => {
                await onDelete(rowId)
              }}
              disabled={isUpdating || isDeleting}
            >
              כן, מחק
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)} disabled={isUpdating || isDeleting}>
              ביטול
            </Button>
          </div>
        ) : (
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
        ))}
      <div className="flex gap-2 ms-auto">
        <Button variant="outline" onClick={onClose} disabled={isUpdating || isDeleting}>
          ביטול
        </Button>
        <Button variant="primary" isLoading={isUpdating} onClick={onSave} disabled={isUpdating || isDeleting}>
          שמור
        </Button>
      </div>
    </div>
  )
}

AdvancePaymentDrawerFooter.displayName = 'AdvancePaymentDrawerFooter'
