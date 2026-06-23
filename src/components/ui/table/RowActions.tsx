import type { AnchorHTMLAttributes } from 'react'
import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  use,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { computeDropdownPosition } from '../../../utils/dropdownMenuUtils'
import { getOverlayPortalOffset, useOverlayPortalContainer } from '../overlays/OverlayPortalContext'
import { useDismissibleLayer } from '../overlays/useDismissibleLayer'
import { Tooltip } from '../primitives/Tooltip'

const DropdownCloseContext = createContext<(() => void) | null>(null)

interface DropdownPos {
  top: number
  left: number
  maxHeight?: number
}

interface DropdownMenuProps {
  ariaLabel?: string
  children: React.ReactNode
  title?: string
  menuClassName?: string
}

const DropdownMenu = ({ ariaLabel, children, title, menuClassName }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false)
  const triggerRectRef = useRef<DOMRect | null>(null)
  const [pos, setPos] = useState<DropdownPos | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const portalContainer = useOverlayPortalContainer()
  const focusTrigger = () => triggerRef.current?.focus({ preventScroll: true })
  const closeMenu = useCallback(() => setOpen(false), [])

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

  const focusMenuItem = (direction: 1 | -1, target?: HTMLElement) => {
    const container = portalRef.current
    if (!container) return
    const items = Array.from(
      container.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled):not([aria-disabled="true"])'),
    )
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
      requestAnimationFrame(() => focusMenuItem(1))
      return
    }
    focusMenuItem(1)
  }

  const handleMenuKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      focusMenuItem(1, event.target as HTMLElement)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      focusMenuItem(-1, event.target as HTMLElement)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      event.stopPropagation()
      focusMenuItem(1)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      event.stopPropagation()
      focusMenuItem(-1)
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
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700"
        aria-label={ariaLabel ?? 'פעולות'}
        aria-haspopup="menu"
        aria-expanded={open}
        title={title}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open &&
        portalContainer &&
        createPortal(
          <DropdownCloseContext.Provider value={closeMenu}>
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
          </DropdownCloseContext.Provider>,
          portalContainer,
        )}
    </>
  )
}

DropdownMenu.displayName = 'DropdownMenu'

const DropdownMenuItem = ({
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
  const close = use(DropdownCloseContext)
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

DropdownMenuItem.displayName = 'DropdownMenuItem'

const hasRenderableContent = (node: React.ReactNode): boolean =>
  Children.toArray(node).some((child) => {
    if (isValidElement(child) && child.type === Fragment) {
      return hasRenderableContent((child.props as { children?: React.ReactNode }).children)
    }
    return true
  })

interface RowActionGroupProps {
  children: React.ReactNode
}

export const RowActionGroup: React.FC<RowActionGroupProps> = ({ children }) => <>{children}</>

RowActionGroup.displayName = 'RowActionGroup'

interface RowActionsMenuProps {
  ariaLabel?: string
  children: React.ReactNode
  title?: string
  menuClassName?: string
}

export const RowActionsMenu: React.FC<RowActionsMenuProps> = ({ ariaLabel, children, title, menuClassName }) => {
  const allChildren = Children.toArray(children)
  const groups = allChildren.filter(
    (child): child is React.ReactElement<RowActionGroupProps> => isValidElement(child) && child.type === RowActionGroup,
  )
  // Grouped separator rendering assumes every child is a RowActionGroup. All current callers
  // wrap every child in a group, so non-group children are only rendered when no group is used
  // at all (plain children passthrough, e.g. ClientRowActions/BinderRowActions/ChargeRowActions).
  const isGrouped = groups.length > 0 && groups.length === allChildren.length
  const visibleGroups = isGrouped ? groups.filter((group) => hasRenderableContent(group.props.children)) : []

  return (
    <div className="flex justify-center">
      <DropdownMenu ariaLabel={ariaLabel ?? 'פעולות'} title={title} menuClassName={menuClassName}>
        {isGrouped
          ? visibleGroups.map((group, index) => (
              <Fragment key={group.key ?? index}>
                {index > 0 && <RowActionSeparator />}
                {group.props.children}
              </Fragment>
            ))
          : children}
      </DropdownMenu>
    </div>
  )
}

RowActionsMenu.displayName = 'RowActionsMenu'

export const RowActionItem = DropdownMenuItem

export const RowActionSeparator = () => <div className="my-1 border-t border-gray-100" />

RowActionSeparator.displayName = 'RowActionSeparator'

interface RowActionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  label: string
  icon: React.ReactNode
}

export const RowActionLink: React.FC<RowActionLinkProps> = ({ href, label, icon, className, onClick, ...props }) => (
  <a
    href={href}
    role="menuitem"
    tabIndex={-1}
    className={
      className ?? 'block w-full px-3 py-2 text-right text-sm text-gray-700 transition-colors hover:bg-gray-50'
    }
    onClick={(event) => {
      event.stopPropagation()
      onClick?.(event)
    }}
    onKeyDown={(event) => {
      event.stopPropagation()
    }}
    {...props}
  >
    <span className="grid w-full grid-cols-[minmax(0,1fr)_1rem] items-center gap-2">
      <span className="truncate">{label}</span>
      <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
    </span>
  </a>
)

RowActionLink.displayName = 'RowActionLink'

type RowActionTone = 'neutral' | 'primary' | 'info' | 'positive' | 'danger'

const rowActionToneClasses: Record<RowActionTone, string> = {
  neutral: 'text-gray-400 hover:bg-gray-100 hover:text-gray-700',
  primary: 'text-primary-400 hover:bg-primary-50 hover:text-primary-600',
  info: 'text-info-400 hover:bg-info-50 hover:text-info-600',
  positive: 'text-positive-500 hover:bg-positive-50 hover:text-positive-700',
  danger: 'text-negative-600 hover:bg-negative-50 hover:text-negative-700',
}

const rowActionSizeClasses = { sm: 'h-6 w-6', md: 'h-8 w-8' } as const

interface RowActionButtonProps {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  /** Semantic colour. Defaults to `neutral` (or `danger` if the legacy `danger` flag is set). */
  tone?: RowActionTone
  /** `sm` (h-6) for dense / inline-edit rows; `md` (h-8, default) for standard tables. */
  size?: 'sm' | 'md'
  /** @deprecated use `tone="danger"`. */
  danger?: boolean
  className?: string
}

export const RowActionButton: React.FC<RowActionButtonProps> = ({
  label,
  icon,
  onClick,
  disabled = false,
  tone,
  size = 'md',
  danger = false,
  className,
}) => {
  const resolvedTone = tone ?? (danger ? 'danger' : 'neutral')
  const button = (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.stopPropagation()
        }
      }}
      className={cn(
        'focus-ring inline-flex items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        rowActionSizeClasses[size],
        rowActionToneClasses[resolvedTone],
        className,
      )}
    >
      {icon}
    </button>
  )
  return <Tooltip text={label}>{button}</Tooltip>
}

RowActionButton.displayName = 'RowActionButton'
