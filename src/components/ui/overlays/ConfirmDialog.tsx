import { type ReactNode } from 'react'
import { Button } from '../primitives/Button'
import { OverlayPortalProvider } from './OverlayPortalContext'
import { useModalDialog } from './useModalDialog'
import { GLOBAL_UI_MESSAGES } from '../../../messages'

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
  confirmLabel = GLOBAL_UI_MESSAGES.actions.confirm,
  cancelLabel = GLOBAL_UI_MESSAGES.actions.cancel,
  confirmVariant = 'primary',
  closeOnBackdrop = true,
  isLoading = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  children,
}) => {
  const { dialogRef, portalHostRef, portalHost } = useModalDialog(open)

  if (!open) return null

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (closeOnBackdrop && event.target === dialogRef.current) onCancel()
  }

  return (
    // Backdrop click-to-close is a mouse-only enhancement; Escape is handled
    // natively by the modal <dialog>, so no keyboard listener is required here.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-sheet-title"
      aria-describedby="confirm-sheet-description"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={handleBackdropClick}
      className="mx-auto my-auto w-[calc(100%-1.5rem)] max-w-md border-none bg-transparent p-0 backdrop:bg-black/45 backdrop:backdrop-blur-[2px] max-sm:mb-3 max-sm:mt-auto"
    >
      <OverlayPortalProvider value={portalHost}>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:p-5">
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
            <Button
              variant="secondary"
              fullWidth
              autoFocus={confirmVariant === 'danger'}
              disabled={isLoading}
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={confirmVariant}
              fullWidth
              autoFocus={confirmVariant !== 'danger'}
              isLoading={isLoading}
              disabled={confirmDisabled || isLoading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
        <div ref={portalHostRef} className="pointer-events-none fixed inset-0 z-[1]" />
      </OverlayPortalProvider>
    </dialog>
  )
}
