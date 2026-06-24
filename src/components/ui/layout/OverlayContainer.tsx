import { X } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { useEffect, useRef, useState } from 'react'
import { OverlayPortalProvider } from '../overlays/OverlayPortalContext'
import { GLOBAL_UI_MESSAGES } from '../../../messages'

type OverlayVariant = 'modal' | 'drawer' | 'dialog'

interface OverlayContainerProps {
  open: boolean
  variant?: OverlayVariant
  title?: React.ReactNode
  subtitle?: React.ReactNode
  footer?: React.ReactNode
  onClose?: () => void
  /** Stacking override. Native <dialog> uses the top layer, so this is rarely needed. */
  zIndex?: number
  children: React.ReactNode
  className?: string
}

export const OverlayContainer: React.FC<OverlayContainerProps> = ({
  open,
  variant = 'modal',
  title,
  subtitle,
  footer,
  onClose,
  zIndex,
  children,
  className,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const portalHostRef = useRef<HTMLDivElement>(null)
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null)

  // Open modally so the browser provides the focus trap, scroll inert-ing,
  // Escape dismissal, focus restoration, and ::backdrop. `open` stays the single
  // source of truth: the dialog unmounts when the parent flips it to false.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return

    if (!dialog.open) dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    setPortalHost(open ? portalHostRef.current : null)
  }, [open])

  if (!open) return null

  const style = zIndex ? { zIndex } : undefined
  const accessibleName = typeof title === 'string' ? title : undefined

  // The `dialog` variant is a forced choice: Escape must not dismiss it.
  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault()
    if (variant !== 'dialog') onClose?.()
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) onClose?.()
  }

  if (variant === 'drawer') {
    return (
      // Backdrop click-to-close is a mouse-only affordance; Escape is handled
      // natively by the modal <dialog>, so no keyboard listener is needed.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
      <dialog
        ref={dialogRef}
        aria-label={accessibleName}
        style={style}
        onCancel={handleCancel}
        onClick={handleBackdropClick}
        className={cn(
          'fixed inset-y-0 right-0 m-0 h-dvh max-h-dvh w-full max-w-md flex-col border-none bg-white p-0 shadow-2xl',
          'translate-x-0 transition-transform duration-300 ease-in-out starting:translate-x-full',
          'backdrop:bg-black/20',
          'flex',
          className,
        )}
      >
        <OverlayPortalProvider value={portalHost}>
          {title && (
            <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-6 py-4" dir="rtl">
              <div>
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label={GLOBAL_UI_MESSAGES.actions.close}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" dir="rtl">
            {children}
          </div>
          {footer && <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">{footer}</div>}
          <div ref={portalHostRef} className="pointer-events-none fixed inset-0 z-[1]" />
        </OverlayPortalProvider>
      </dialog>
    )
  }

  if (variant === 'dialog') {
    return (
      <dialog
        ref={dialogRef}
        aria-label={accessibleName ?? GLOBAL_UI_MESSAGES.common.dialog}
        style={style}
        onCancel={handleCancel}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border-none bg-white p-6 shadow-2xl backdrop:bg-black/40"
      >
        <OverlayPortalProvider value={portalHost}>
          {children}
          <div ref={portalHostRef} className="pointer-events-none fixed inset-0 z-[1]" />
        </OverlayPortalProvider>
      </dialog>
    )
  }

  // modal (default) — Escape closes, but backdrop click does not.
  return (
    <dialog
      ref={dialogRef}
      aria-label={accessibleName}
      style={style}
      onCancel={handleCancel}
      className="m-auto flex max-h-[92vh] w-[calc(100%-2rem)] max-w-xl flex-col border-none bg-transparent p-0 backdrop:bg-black/30"
    >
      <OverlayPortalProvider value={portalHost}>
        <div dir="rtl" className={cn('flex max-h-[92vh] w-full flex-col rounded-xl bg-white shadow-xl', className)}>
          {title && (
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label={GLOBAL_UI_MESSAGES.actions.close}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-6 py-4">{children}</div>
          {footer && <div className="shrink-0 border-t border-gray-100 px-6 py-4">{footer}</div>}
        </div>
        <div ref={portalHostRef} className="pointer-events-none fixed inset-0 z-[1]" />
      </OverlayPortalProvider>
    </dialog>
  )
}

OverlayContainer.displayName = 'OverlayContainer'
