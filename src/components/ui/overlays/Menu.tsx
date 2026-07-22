import { createContext, use, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { EllipsisVertical } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { computeDropdownPosition } from '../../../utils/dropdownMenuUtils'
import { getOverlayPortalOffset, useOverlayPortalContainer } from './OverlayPortalContext'
import { useDismissibleLayer } from './useDismissibleLayer'
import { useMenuRovingFocus } from './useMenuRovingFocus'
import { Button } from '../primitives/Button'
import { Tooltip } from '../primitives/Tooltip'
import { GLOBAL_UI_MESSAGES } from '../../../messages'

const MenuCloseContext = createContext<(() => void) | null>(null)

interface MenuPos {
  top: number
  left: number
  maxHeight?: number
}

export interface MenuProps {
  ariaLabel?: string
  children: React.ReactNode
  title?: string
  menuClassName?: string
}

export const Menu = ({ ariaLabel, children, title, menuClassName }: MenuProps) => {
  const [open, setOpen] = useState(false)
  const triggerRectRef = useRef<DOMRect | null>(null)
  const [pos, setPos] = useState<MenuPos | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const portalContainer = useOverlayPortalContainer()
  const focusTrigger = () => triggerRef.current?.focus({ preventScroll: true })
  const closeMenu = useCallback(() => setOpen(false), [])
  const { focusItem, focusBoundary } = useMenuRovingFocus(portalRef)

  useDismissibleLayer({
    open,
    triggerRef,
    layerRef: portalRef,
    onDismiss: () => {
      setOpen(false)
      focusTrigger()
    },
    closeOnEscape: true,
    closeOnScroll: true,
    closeOnResize: true,
  })

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    triggerRectRef.current = rect
    setPos(null)
    setOpen(true)
  }

  const toggle = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (open) {
      setOpen(false)
      return
    }
    openMenu()
  }

  const handleTriggerKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    event.stopPropagation()
    if (!open) {
      openMenu()
      requestAnimationFrame(() => focusItem(1))
      return
    }
    focusItem(1)
  }

  const handleMenuKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      focusItem(1, event.target as HTMLElement)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      focusItem(-1, event.target as HTMLElement)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      event.stopPropagation()
      focusBoundary('first')
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      event.stopPropagation()
      focusBoundary('last')
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      focusTrigger()
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.stopPropagation()
    }
  }

  useLayoutEffect(() => {
    const triggerRect = triggerRectRef.current
    if (!open || !triggerRect || pos) return
    const element = portalRef.current
    if (!element) return
    const menuRect = element.getBoundingClientRect()
    setPos(
      computeDropdownPosition(
        triggerRect,
        { width: menuRect.width, height: menuRect.height },
        { width: window.innerWidth, height: window.innerHeight },
      ),
    )
  }, [open, pos])

  const portalOffset = getOverlayPortalOffset(portalContainer)

  return (
    <>
      <Button
        ref={triggerRef}
        variant="outline"
        shape="square"
        size="sm"
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        icon={<EllipsisVertical className="h-4 w-4" />}
        aria-label={ariaLabel ?? GLOBAL_UI_MESSAGES.common.actions}
        aria-haspopup="menu"
        aria-expanded={open}
        title={title}
      />

      {open &&
        portalContainer &&
        createPortal(
          <MenuCloseContext.Provider value={closeMenu}>
            <div
              ref={portalRef}
              style={
                pos
                  ? {
                      position: 'fixed',
                      top: pos.top - portalOffset.top,
                      left: pos.left - portalOffset.left,
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
              className={cn(
                'pointer-events-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg',
                menuClassName ?? 'min-w-40',
              )}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={handleMenuKeyDown}
              role="menu"
              tabIndex={-1}
            >
              {children}
            </div>
          </MenuCloseContext.Provider>,
          portalContainer,
        )}
    </>
  )
}

Menu.displayName = 'Menu'

export const MenuItem = ({
  label,
  onClick,
  icon,
  danger = false,
  disabled = false,
  tooltip,
}: {
  label: string
  onClick: (event?: React.MouseEvent<HTMLButtonElement>) => void
  icon: React.ReactNode
  danger?: boolean
  disabled?: boolean
  tooltip?: string
}) => {
  const close = use(MenuCloseContext)
  const item = (
    <button
      role="menuitem"
      type="button"
      tabIndex={-1}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onClick(event)
        close?.()
      }}
      onKeyDown={(event) => {
        event.stopPropagation()
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
  return tooltip ? <Tooltip text={tooltip}>{item}</Tooltip> : item
}

MenuItem.displayName = 'MenuItem'
