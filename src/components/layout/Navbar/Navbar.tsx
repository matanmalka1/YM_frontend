import { useState, type RefObject } from 'react'
import { PanelRight, Search, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { NotificationBell } from '../NotificationBell'
import { useAuthStore } from '@/store/auth.store'
import { cn, formatHebrewDate } from '@/utils/utils'
import { NAV_GROUPS } from './Navbar.constants'
import { NavbarPrimaryNav } from './NavbarPrimaryNav'
import { canShowItem } from './Navbar.utils'

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items)

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
  const [searchValue, setSearchValue] = useState('')
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const visibleItems = ALL_NAV_ITEMS.filter((item) => canShowItem(item, user?.role))

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

  return (
    <header className="z-10 flex h-16 shrink-0 items-center gap-3 border-b border-gray-200/80 bg-white px-3 md:px-4">
      <NavbarPrimaryNav items={visibleItems} />
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
