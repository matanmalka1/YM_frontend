import { useRef, useState, useEffect, type KeyboardEvent, type RefObject } from 'react'
import { ChevronDown, PanelRight, Search, Users } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { NotificationBell } from '../NotificationBell'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types'
import { cn, formatHebrewDate } from '@/utils/utils'
import { NAV_GROUPS, type NavItem } from './Navbar.constants'
import { useDismissibleLayer } from '../../ui/overlays/useDismissibleLayer'

interface MoreNavGroup {
  label: string
  items: NavItem[]
}

const buildMoreGroups = (items: NavItem[]): MoreNavGroup[] => {
  const groups = new Map<string, NavItem[]>()
  for (const item of items) {
    if (item.placement !== 'more') continue
    const label = item.moreGroup ?? 'עוד'
    const groupItems = groups.get(label) ?? []
    groupItems.push(item)
    groups.set(label, groupItems)
  }
  return Array.from(groups.entries()).map(([label, groupItems]) => ({
    label,
    items: groupItems,
  }))
}

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items)

const canShowItem = (item: Pick<NavItem, 'roles'>, role?: UserRole): boolean => {
  if (!item.roles) return true
  if (!role) return false
  return item.roles.includes(role)
}

const isRouteActive = (pathname: string, item: Pick<NavItem, 'to' | 'end'>) =>
  item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)

interface NavbarProps {
  onOpenClientSidebar: () => void
  clientSidebarTriggerRef: RefObject<HTMLButtonElement | null>
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenClientSidebar,
  clientSidebarTriggerRef,
  sidebarOpen,
  onToggleSidebar,
}) => {
  const [moreOpen, setMoreOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [hiddenCount, setHiddenCount] = useState(0)
  const navigate = useNavigate()
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const cachedWidths = useRef<number[]>([])
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const visibleItems = ALL_NAV_ITEMS.filter((item) => canShowItem(item, user?.role))
  const visibleNavItems = visibleItems.filter((item) => item.placement === 'top')
  const staticMoreGroups = buildMoreGroups(visibleItems)
  const alwaysShowMore = staticMoreGroups.length > 0

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const measure = () => {
      const items = itemRefs.current.slice(0, visibleNavItems.length)
      if (items.some((el) => !el)) return
      items.forEach((el, i) => {
        if (el && !el.classList.contains('hidden')) cachedWidths.current[i] = el.getBoundingClientRect().width
      })
      let usedWidth = 8 // p-1 padding both sides
      let firstHidden = visibleNavItems.length
      for (let i = 0; i < visibleNavItems.length; i++) {
        const itemWidth = (cachedWidths.current[i] ?? 80) + 4 // gap-1
        const reserveMore = alwaysShowMore || i < visibleNavItems.length - 1 ? 88 : 0
        if (usedWidth + itemWidth + reserveMore > nav.clientWidth) {
          firstHidden = i
          break
        }
        usedWidth += itemWidth
      }
      setHiddenCount(visibleNavItems.length - firstHidden)
    }
    const ro = new ResizeObserver(measure)
    ro.observe(nav)
    measure()
    return () => ro.disconnect()
  }, [visibleNavItems.length, alwaysShowMore])

  const overflowItems = hiddenCount > 0 ? visibleNavItems.slice(visibleNavItems.length - hiddenCount) : []
  const overflowGroup: MoreNavGroup | null = overflowItems.length > 0 ? { label: 'ניווט', items: overflowItems } : null
  const moreGroups: MoreNavGroup[] = overflowGroup ? [overflowGroup, ...staticMoreGroups] : staticMoreGroups

  const hasActiveMoreItem = moreGroups.some((group) =>
    group.items.some((item) => isRouteActive(location.pathname, item)),
  )

  useDismissibleLayer({
    open: moreOpen,
    triggerRef: moreButtonRef,
    layerRef: moreMenuRef,
    onDismiss: () => {
      setMoreOpen(false)
      moreButtonRef.current?.focus()
    },
    closeOnEscape: true,
  })

  const getMoreMenuItems = () =>
    Array.from(moreMenuRef.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]') ?? [])

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = searchValue.trim()
    if (!trimmed) {
      navigate('/search')
      return
    }
    const params = new URLSearchParams({ search: trimmed })
    navigate({ pathname: '/search', search: params.toString() })
  }

  const closeMoreMenu = () => {
    setMoreOpen(false)
    moreButtonRef.current?.focus()
  }

  const handleMoreMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = getMoreMenuItems()
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
      closeMoreMenu()
    }
  }

  return (
    <header
      role="banner"
      dir="rtl"
      className="z-10 flex h-16 shrink-0 items-center gap-3 border-b border-gray-200/80 bg-white px-3 md:px-4"
    >
      <div className="flex min-w-0 flex-1 items-center">
        <nav ref={navRef} className="min-w-0 flex-1 overflow-hidden" aria-label="ניווט ראשי">
          <ul className="flex items-center gap-1 rounded-xl bg-gray-50 p-1">
            {visibleNavItems.map((item, index) => {
              const hidden = hiddenCount > 0 && index >= visibleNavItems.length - hiddenCount
              return (
                <li
                  key={item.to}
                  ref={(el) => {
                    itemRefs.current[index] = el
                  }}
                  className={hidden ? 'priority-nav-hidden hidden' : undefined}
                >
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'focus-ring inline-flex h-9 items-center whitespace-nowrap rounded-[10px] border px-3 text-sm font-medium transition',
                        isActive
                          ? 'border-gray-200 bg-white font-semibold text-gray-950 shadow-sm'
                          : 'border-transparent text-gray-600 hover:bg-white/80 hover:text-gray-950',
                      )
                    }
                  >
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>
        {moreGroups.length > 0 ? (
          <div className="relative mr-1 shrink-0 rounded-xl bg-gray-50 p-1">
            <button
              ref={moreButtonRef}
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setMoreOpen(true)
                  requestAnimationFrame(() => getMoreMenuItems()[0]?.focus())
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setMoreOpen(true)
                  requestAnimationFrame(() => {
                    const items = getMoreMenuItems()
                    items[items.length - 1]?.focus()
                  })
                }
              }}
              className={cn(
                'focus-ring inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-[10px] border px-3 text-sm font-medium transition',
                hasActiveMoreItem
                  ? 'border-gray-200 bg-white font-semibold text-gray-950 shadow-sm'
                  : 'border-transparent text-gray-600 hover:bg-white/80 hover:text-gray-950',
              )}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
            >
              <span>עוד</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', moreOpen && 'rotate-180')} />
            </button>
            {moreOpen ? (
              <div
                ref={moreMenuRef}
                className="fixed left-3 right-3 top-14 z-50 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 text-right shadow-elevation-3 md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-64"
                role="menu"
                tabIndex={-1}
                onKeyDown={handleMoreMenuKeyDown}
              >
                {moreGroups.map((group, groupIndex) => {
                  return (
                    <div
                      key={group.label}
                      className={cn('py-1', groupIndex > 0 && 'mt-1 border-t border-gray-100 pt-2')}
                    >
                      <p className="px-2 pb-1.5 text-xs font-semibold text-gray-500">{group.label}</p>
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const active = isRouteActive(location.pathname, item)

                        return (
                          <NavLink
                            key={`${group.label}-${item.to}`}
                            to={item.to}
                            end={item.end}
                            onClick={() => setMoreOpen(false)}
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
                  )
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="hidden shrink-0 items-center border-r border-gray-100 pr-3 md:flex">
        <span
          className="rounded-full bg-gray-50 px-3 py-1.5 text-xs tabular-nums text-gray-500"
          suppressHydrationWarning
        >
          {formatHebrewDate(new Date())}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 border-r border-gray-100 pr-3">
        <button
          ref={clientSidebarTriggerRef}
          type="button"
          onClick={onOpenClientSidebar}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 md:hidden"
          aria-label="רשימת לקוחות"
        >
          <Users className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className={cn(
            'focus-ring hidden h-10 w-10 items-center justify-center rounded-xl border transition md:inline-flex',
            sidebarOpen
              ? 'border-gray-200 bg-white text-gray-500 shadow-sm hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900'
              : 'border-primary-200 bg-primary-50 text-primary-600 shadow-sm hover:border-primary-300 hover:bg-primary-100',
          )}
          aria-label={sidebarOpen ? 'סגירת רשימת לקוחות' : 'פתיחת רשימת לקוחות'}
          aria-pressed={sidebarOpen}
        >
          <PanelRight className="h-[18px] w-[18px]" />
        </button>
        <form onSubmit={handleSearchSubmit} role="search" className="hidden md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="חיפוש..."
              aria-label="חיפוש"
              className="h-10 w-44 rounded-xl border border-gray-200 bg-gray-50/80 pr-9 pl-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:w-56 focus:border-primary-300 focus:bg-white focus:ring-4 focus:ring-primary-50"
            />
          </div>
        </form>
        <NotificationBell />
      </div>
    </header>
  )
}
