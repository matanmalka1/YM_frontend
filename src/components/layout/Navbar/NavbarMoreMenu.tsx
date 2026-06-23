import { useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/primitives/Button'
import { useDismissibleLayer } from '@/components/ui/overlays/useDismissibleLayer'
import { cn } from '@/utils/utils'

import type { MoreNavGroup } from './Navbar.utils'
import { isRouteActive } from './Navbar.utils'

interface NavbarMoreMenuProps {
  groups: MoreNavGroup[]
}

export const NavbarMoreMenu: React.FC<NavbarMoreMenuProps> = ({ groups }) => {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const hasActiveItem = groups.some((group) => group.items.some((item) => isRouteActive(location.pathname, item)))

  useDismissibleLayer({
    open,
    triggerRef: buttonRef,
    layerRef: menuRef,
    onDismiss: () => {
      setOpen(false)
      buttonRef.current?.focus()
    },
    closeOnEscape: true,
  })

  const getMenuItems = () => Array.from(menuRef.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]') ?? [])

  const closeMenu = () => {
    setOpen(false)
    buttonRef.current?.focus()
  }

  const focusMenuBoundary = (position: 'first' | 'last') => {
    setOpen(true)
    requestAnimationFrame(() => {
      const items = getMenuItems()
      const item = position === 'first' ? items[0] : items[items.length - 1]
      item?.focus()
    })
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = getMenuItems()
    if (items.length === 0) return

    const currentIndex = items.findIndex((item) => item === document.activeElement)

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + direction + items.length) % items.length
      items[nextIndex]?.focus()
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      items[0]?.focus()
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      items[items.length - 1]?.focus()
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeMenu()
    }
  }

  return (
    <div className="relative mr-1 shrink-0 rounded-xl bg-gray-50 p-1">
      <Button
        ref={buttonRef}
        type="button"
        variant={hasActiveItem ? 'secondary' : 'ghost'}
        size="sm"
        icon={<ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />}
        iconPosition="end"
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            focusMenuBoundary('first')
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            focusMenuBoundary('last')
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        עוד
      </Button>
      {open ? (
        <div
          ref={menuRef}
          className="fixed left-3 right-3 top-14 z-50 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 text-right shadow-elevation-3 md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-64"
          role="menu"
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
        >
          {groups.map((group, groupIndex) => (
            <div key={group.label} className={cn('py-1', groupIndex > 0 && 'mt-1 border-t border-gray-100 pt-2')}>
              <p className="px-2 pb-1.5 text-xs font-semibold text-gray-500">{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isRouteActive(location.pathname, item)

                return (
                  <NavLink
                    key={`${group.label}-${item.to}`}
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'focus-ring flex items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-sm transition',
                      active
                        ? 'bg-gray-100 font-semibold text-gray-950'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-950',
                    )}
                    role="menuitem"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{item.menuLabel ?? item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
