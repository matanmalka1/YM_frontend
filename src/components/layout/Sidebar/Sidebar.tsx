import { useState } from 'react'
import { ChevronLeft, ChevronRight, LogOut, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '../../../store/auth.store'
import { getRoleLabel } from '../../../utils/enums'
import { cn } from '../../../utils/utils'
import { SidebarGroup } from './SidebarGroup'
import { NAV_GROUPS } from './sidebar.constants'

export interface SidebarProps {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    main: true,
    clients: true,
    'tax-work': true,
    'office-ops': true,
    finance: true,
    analytics: true,
    settings: true,
  })
  const { user, logout } = useAuthStore()
  const visibleNavGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || item.roles.includes(user?.role ?? 'secretary')),
  })).filter((group) => group.items.length > 0)

  const handleLogout = () => {
    void logout()
  }

  const toggleGroup = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-gray-200 bg-white text-gray-900 shadow-xl shadow-gray-200/70 transition-all duration-200',
        isSidebarOpen ? 'w-46' : 'w-16',
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4">
        {isSidebarOpen ? (
          <span className="text-xl font-bold tracking-wider">YM Tax Crm</span>
        ) : (
          <span className="mx-auto text-sm font-bold">YM</span>
        )}
        <button
          onClick={toggleSidebar}
          className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          aria-label={isSidebarOpen ? 'כווץ תפריט' : 'הרחב תפריט'}
        >
          {isSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-5">
        {visibleNavGroups.map((group) => (
          <SidebarGroup
            key={group.key}
            group={group}
            isSidebarOpen={isSidebarOpen}
            isExpanded={expanded[group.key] ?? true}
            onToggle={() => toggleGroup(group.key)}
          />
        ))}
      </nav>

      <div className="shrink-0 border-t border-gray-200 px-2 py-3">
        {isSidebarOpen ? (
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <UserIcon className="h-4 w-4 text-gray-500" />
              </div>
              <div className="min-w-0 text-right">
                <p className="truncate text-sm font-medium leading-tight text-gray-900">{user?.full_name || 'אורח'}</p>
                {user?.role && (
                  <p className="truncate text-xs leading-tight text-gray-500">{getRoleLabel(user.role)}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-negative-50 hover:text-negative-600"
              aria-label="התנתקות"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <UserIcon className="h-4 w-4 text-gray-500" />
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-negative-50 hover:text-negative-600"
              aria-label="התנתקות"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
