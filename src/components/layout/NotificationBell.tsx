import { Bell } from 'lucide-react'
import { NotificationDrawer, useNotificationBell } from '../../features/notifications'

export const NotificationBell: React.FC = () => {
  const { drawerOpen, unreadCount, handleOpen, handleClose } = useNotificationBell()

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        aria-label="התראות"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            role="status"
            aria-label={`${unreadCount > 99 ? '99+' : unreadCount} התראות חדשות`}
            className="absolute -top-1 -right-1 flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-negative-500 text-[10px] font-bold text-white leading-none"
          >
            <span aria-hidden="true">{unreadCount > 99 ? '99+' : unreadCount}</span>
          </span>
        )}
      </button>
      <NotificationDrawer open={drawerOpen} onClose={handleClose} />
    </>
  )
}
NotificationBell.displayName = 'NotificationBell'
