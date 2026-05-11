import { useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NotificationBell } from './NotificationBell'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types'
import { cn } from '@/utils/utils'
import { NAV_GROUPS, type NavItem } from './Sidebar/sidebar.constants'
import { useDismissibleLayer } from '../ui/overlays/useDismissibleLayer'

type TopNavItem = Pick<NavItem, 'to' | 'label' | 'end' | 'roles'>

const getNavItem = (to: string): NavItem => {
  const item = NAV_GROUPS.flatMap((group) => group.items).find((navItem) => navItem.to === to)
  if (!item) throw new Error(`Missing nav item for route: ${to}`)
  return item
}

const TOP_NAV_ITEMS: TopNavItem[] = [
  getNavItem('/'),
  getNavItem('/clients'),
  getNavItem('/work-queue'),
  { ...getNavItem('/tax/vat'), label: 'מע״מ' },
  getNavItem('/tax/advance-payments'),
  getNavItem('/tax/reports'),
  getNavItem('/charges'),
  { ...getNavItem('/settings/users'), label: 'הגדרות' },
]

interface MoreNavGroup {
  label: string
  items: Array<NavItem & { menuLabel?: string }>
}

const MORE_NAV_GROUPS: MoreNavGroup[] = [
  {
    label: 'תפעול',
    items: [getNavItem('/binders'), getNavItem('/tasks')],
  },
  {
    label: 'מס',
    items: [
      getNavItem('/tax/calendar'),
      getNavItem('/settings/tax-calendar'),
      getNavItem('/reports/advance-payments'),
      getNavItem('/reports/annual-status'),
    ],
  },
  {
    label: 'ניהול',
    items: [
      getNavItem('/reports/aging'),
      { ...getNavItem('/reports/vat-compliance'), menuLabel: 'דוחות ניתוח' },
      getNavItem('/settings/users'),
    ],
  },
]

const canShowItem = (item: Pick<NavItem, 'roles'>, role?: UserRole) =>
  !item.roles || item.roles.some((allowedRole) => allowedRole === role)

const isRouteActive = (pathname: string, item: Pick<NavItem, 'to' | 'end'>) =>
  item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)

export const Navbar: React.FC = () => {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const visibleNavItems = TOP_NAV_ITEMS.filter((item) => canShowItem(item, user?.role))
  const moreGroups = MORE_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canShowItem(item, user?.role)),
  })).filter((group) => group.items.length > 0)
  const hasActiveMoreItem = moreGroups.some((group) => group.items.some((item) => isRouteActive(location.pathname, item)))

  useDismissibleLayer({
    open: moreOpen,
    triggerRef: moreButtonRef,
    layerRef: moreMenuRef,
    onDismiss: () => setMoreOpen(false),
    closeOnEscape: true,
  })

  return (
    <header
      role="banner"
      className="z-10 flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3 md:px-5"
    >
      <div className="flex min-w-0 flex-1 items-center">
        <nav
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="ניווט ראשי"
        >
          <ul className="flex min-w-max items-center gap-0.5">
            {visibleNavItems.map((item) => {
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'inline-flex h-8 items-center whitespace-nowrap rounded-md px-2.5 text-sm font-medium transition',
                        isActive
                          ? 'bg-primary-50 text-primary-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.08)]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950',
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
          <div className="relative mr-1 shrink-0">
            <button
              ref={moreButtonRef}
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              className={cn(
                'inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-md px-2.5 text-sm font-medium transition',
                hasActiveMoreItem
                  ? 'bg-primary-50 text-primary-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.08)]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950',
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
                className="absolute right-0 top-full z-50 mt-2 max-h-[calc(100vh-5rem)] w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 text-right shadow-lg"
                role="menu"
              >
                {moreGroups.map((group, groupIndex) => (
                  <div key={group.label} className={cn('py-1', groupIndex > 0 && 'border-t border-gray-100')}>
                    <p className="px-3 pb-1 text-xs font-semibold text-gray-400">{group.label}</p>
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
                            'flex items-center justify-between gap-3 px-3 py-2 text-sm transition',
                            active ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-950',
                          )}
                          role="menuitem"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                          <span className="min-w-0 flex-1 truncate">{item.menuLabel ?? item.label}</span>
                        </NavLink>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 border-r border-gray-200 pr-2">
        <Link
          to="/search"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
          aria-label="חיפוש"
        >
          <Search className="h-5 w-5" />
        </Link>
        <NotificationBell />
      </div>
    </header>
  )
}
