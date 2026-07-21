import { useState, type RefObject } from 'react'
import { PanelRight, Search, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { NotificationBell } from '../NotificationBell'
import { Input } from '@/components/ui/inputs/Input'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { useAuthStore } from '@/store/auth.store'
import { formatHebrewDate } from '@/utils/utils'
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

export const Navbar: React.FC<NavbarProps> = ({ onOpenClientSidebar, clientSidebarTriggerRef, sidebarOpen, onToggleSidebar }) => {
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
    <header className="z-10 flex h-14 shrink-0 items-center gap-1.5 border-b border-gray-200/80 bg-white px-2 md:px-3">
      <NavbarPrimaryNav items={visibleItems} />
      <div className="hidden shrink-0 items-center border-r border-gray-100 pr-2 md:flex">
        <Badge variant="neutral" size="sm" className="tabular-nums" suppressHydrationWarning>
          {formatHebrewDate(new Date())}
        </Badge>
      </div>
      <div className="flex shrink-0 items-center gap-1 border-r border-gray-100 pr-2">
        <Button
          ref={clientSidebarTriggerRef}
          type="button"
          variant="outline"
          shape="square"
          size="md"
          icon={<Users className="h-4 w-4" />}
          onClick={onOpenClientSidebar}
          className="md:hidden"
          aria-label="רשימת לקוחות"
        />
        <Button
          type="button"
          variant={sidebarOpen ? 'outline' : 'secondary'}
          shape="square"
          size="md"
          icon={<PanelRight className="h-4 w-4" />}
          onClick={onToggleSidebar}
          className="hidden md:inline-flex"
          aria-label={sidebarOpen ? 'סגירת רשימת לקוחות' : 'פתיחת רשימת לקוחות'}
          aria-pressed={sidebarOpen}
        />
        <form onSubmit={handleSearchSubmit} role="search" className="hidden md:block">
          <div className="w-36">
            <Input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="חיפוש..."
              aria-label="חיפוש"
              startIcon={<Search className="h-4 w-4" />}
            />
          </div>
        </form>
        <NotificationBell />
      </div>
    </header>
  )
}
