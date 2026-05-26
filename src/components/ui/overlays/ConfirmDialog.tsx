import { useEffect, type ReactNode } from 'react'
import { Button } from '../primitives/Button'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'danger'
  closeOnBackdrop?: boolean
  isLoading?: boolean
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'אישור',
  cancelLabel = 'ביטול',
  confirmVariant = 'primary',
  closeOnBackdrop = true,
  isLoading = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  children,
}) => {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-3 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={() => closeOnBackdrop && onCancel()}
      aria-hidden={!open}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-sheet-title"
        aria-describedby="confirm-sheet-description"
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-150 sm:p-5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />

        <div className="space-y-2 text-right">
          <h2 id="confirm-sheet-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <p id="confirm-sheet-description" className="text-sm leading-6 text-gray-600">
            {message}
          </p>
          {children}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="secondary" fullWidth disabled={isLoading} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            fullWidth
            autoFocus
            isLoading={isLoading}
            disabled={confirmDisabled || isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  )
}
