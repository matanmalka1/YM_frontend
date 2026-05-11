import { useRef, useState, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { computeDropdownPosition } from '../../../utils/dropdownMenuUtils'
import { useDismissibleLayer } from './useDismissibleLayer'

interface DropdownPos {
  top: number
  left: number
  maxHeight?: number
}

interface DropdownMenuProps {
  ariaLabel?: string
  children: React.ReactNode
  title?: string
}

export const DropdownMenu = ({ ariaLabel, children, title }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const [pos, setPos] = useState<DropdownPos | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)

  useDismissibleLayer({
    open,
    triggerRef,
    layerRef: portalRef,
    onDismiss: () => setOpen(false),
    closeOnScroll: true,
    closeOnResize: true,
  })

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (open) {
      setOpen(false)
      return
    }
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setTriggerRect(rect)
    setPos(null) // will measure in layout effect
    setOpen(true)
  }

  const focusMenuItem = (direction: 1 | -1, target?: HTMLElement) => {
    const container = portalRef.current
    if (!container) return
    const items = Array.from(container.querySelectorAll<HTMLElement>('button:not(:disabled)'))
    if (items.length === 0) return

    const activeIndex = target ? items.indexOf(target) : -1
    const nextIndex =
      activeIndex < 0
        ? direction === 1
          ? 0
          : items.length - 1
        : (activeIndex + direction + items.length) % items.length
    items[nextIndex]?.focus()
  }

  const handleTriggerKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    if (!open) {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      setTriggerRect(rect)
      setPos(null)
      setOpen(true)
      requestAnimationFrame(() => focusMenuItem(1))
      return
    }
    focusMenuItem(1)
  }

  const handleMenuKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusMenuItem(1, event.target as HTMLElement)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusMenuItem(-1, event.target as HTMLElement)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      focusMenuItem(1)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      focusMenuItem(-1)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  // Measure menu after first render, then compute position
  useLayoutEffect(() => {
    if (!open || !triggerRect || pos) return
    const el = portalRef.current
    if (!el) return
    const menuRect = el.getBoundingClientRect()
    setPos(
      computeDropdownPosition(
        triggerRect,
        { width: menuRect.width, height: menuRect.height },
        { width: window.innerWidth, height: window.innerHeight },
      ),
    )
  }, [open, triggerRect, pos])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label={ariaLabel ?? 'פעולות'}
        aria-haspopup="menu"
        aria-expanded={open}
        title={title}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open &&
        createPortal(
          <div
            ref={portalRef}
            style={
              pos
                ? {
                    position: 'fixed',
                    top: pos.top,
                    left: pos.left,
                    maxHeight: pos.maxHeight,
                    overflowY: pos.maxHeight ? 'auto' : undefined,
                    zIndex: 9999,
                  }
                : {
                    position: 'fixed',
                    visibility: 'hidden' as const,
                    top: -9999,
                    left: -9999,
                    zIndex: 9999,
                  }
            }
            className="min-w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleMenuKeyDown}
            role="menu"
            tabIndex={-1}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  )
}

DropdownMenu.displayName = 'DropdownMenu'

export const DropdownMenuItem = ({
  label,
  onClick,
  icon,
  danger = false,
  disabled = false,
}: {
  label: string
  onClick: () => void
  icon: React.ReactNode
  danger?: boolean
  disabled?: boolean
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation()
      onClick()
    }}
    className={cn(
      'w-full px-3 py-2 text-right text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40',
      danger ? 'text-negative-600 hover:bg-negative-50' : 'text-gray-700',
    )}
  >
    <span className="grid w-full grid-cols-[minmax(0,1fr)_1rem] items-center gap-2">
      <span className="truncate">{label}</span>
      <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
    </span>
  </button>
)

DropdownMenuItem.displayName = 'DropdownMenuItem'
