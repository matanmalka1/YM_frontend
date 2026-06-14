import { useMatch } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { NotificationDrawer, useNotificationBell } from '../../features/notifications'

export const NotificationBell: React.FC = () => {
  const { drawerOpen, openDrawer, closeDrawer } = useNotificationBell()
  const clientMatch = useMatch('/clients/:clientId/*')
  const clientRecordId = clientMatch?.params.clientId ? Number(clientMatch.params.clientId) : undefined

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        className="focus-ring relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
        aria-label="התראות"
      >
        <Bell className="h-[18px] w-[18px]" />
      </button>
      <NotificationDrawer open={drawerOpen} onClose={closeDrawer} clientRecordId={clientRecordId} />
    </>
  )
}
NotificationBell.displayName = 'NotificationBell'
