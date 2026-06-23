import { useMatch } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { NotificationDrawer, useNotificationBell } from '../../features/notifications'

export const NotificationBell: React.FC = () => {
  const { drawerOpen, openDrawer, closeDrawer } = useNotificationBell()
  const clientMatch = useMatch('/clients/:clientId/*')
  const clientRecordId = clientMatch?.params.clientId ? Number(clientMatch.params.clientId) : undefined

  return (
    <>
      <Button
        variant="outline"
        shape="square"
        size="lg"
        icon={<Bell className="h-[18px] w-[18px]" />}
        onClick={openDrawer}
        className="relative border-gray-200 text-gray-500 shadow-sm hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
        aria-label="התראות"
        tooltip="התראות"
      />
      <NotificationDrawer open={drawerOpen} onClose={closeDrawer} clientRecordId={clientRecordId} />
    </>
  )
}
NotificationBell.displayName = 'NotificationBell'
