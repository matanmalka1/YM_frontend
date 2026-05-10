import { Menu, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NotificationBell } from './NotificationBell'

interface NavbarProps {
  toggleSidebar: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  return (
    <header
      role="banner"
      className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 z-10 shrink-0"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 lg:hidden text-gray-600"
          aria-label="פתח תפריט"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-xl font-bold text-gray-900">יוסף מאיר מערכת ניהול</span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/search"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="חיפוש"
        >
          <Search className="w-5 h-5" />
        </Link>
        <NotificationBell />
      </div>
    </header>
  )
}
