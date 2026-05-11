import { cn } from '../../../utils/utils'
import { useEffect, useRef } from 'react'
import { useEscapeToClose } from '../overlays/useEscapeToClose'

type OverlayVariant = 'modal' | 'drawer' | 'dialog'

interface OverlayContainerProps {
  open: boolean
  variant?: OverlayVariant
  title?: React.ReactNode
  subtitle?: React.ReactNode
  footer?: React.ReactNode
  onClose?: () => void
  /** Z-index override. Defaults: modal=50, drawer=40, dialog=60 */
  zIndex?: number
  children: React.ReactNode
  className?: string
}

const defaultZIndex: Record<OverlayVariant, number> = {
  modal: 50,
  drawer: 40,
  dialog: 60,
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
  const z = zIndex ?? defaultZIndex[variant]
  const containerRef = useRef<HTMLDivElement>(null)
  const lastFocusedElementRef = useRef<HTMLElement | null>(null)
  useEscapeToClose({ open: open && variant !== 'dialog', onClose })

  useEffect(() => {
    if (!open) return

    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const frame = requestAnimationFrame(() => {
      const container = containerRef.current
      if (!container) return
      const firstFocusable = container.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      firstFocusable?.focus()
    })

    return () => {
      cancelAnimationFrame(frame)
      lastFocusedElementRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    const container = containerRef.current
    if (!open || !container) return

    const handleContainerKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1)

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
        return
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleContainerKeyDown)
    return () => container.removeEventListener('keydown', handleContainerKeyDown)
  }, [onClose, open])

  if (variant === 'drawer') {
    return (
      <>
        {/* Backdrop */}
        <div
          className={cn(
            'fixed inset-0 bg-black/20 transition-opacity duration-200',
            open ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          style={{ zIndex: z }}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer panel — slides in from the inline-end edge (RTL-safe) */}
        <div
          ref={containerRef}
          className={cn(
            'fixed inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl',
            'transition-transform duration-300 ease-in-out',
            open ? 'translate-x-0' : 'translate-x-full',
            className,
          )}
          style={{ zIndex: z + 10 }}
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : undefined}
          tabIndex={-1}
        >
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
                  aria-label="סגירה"
                >
                  ✕
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" dir="rtl">
            {children}
          </div>
          {footer && <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">{footer}</div>}
        </div>
      </>
    )
  }

  if (variant === 'dialog') {
    if (!open) return null
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 flex items-center justify-center bg-black/40 px-4"
        style={{ zIndex: z }}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <div className={cn('w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl', className)}>{children}</div>
      </div>
    )
  }

  // modal (default)
  if (!open) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center bg-black/30 px-4"
      style={{ zIndex: z }}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : undefined}
      tabIndex={-1}
    >
      <div className={cn('flex max-h-[92vh] w-full max-w-xl flex-col rounded-xl bg-white shadow-xl', className)}>
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="סגירה"
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6 py-4">{children}</div>
        {footer && <div className="shrink-0 border-t border-gray-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

OverlayContainer.displayName = 'OverlayContainer'
