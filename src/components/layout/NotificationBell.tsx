import { useState } from 'react'
import { useMatch } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { NotificationDrawer } from '../../features/notifications'

export const NotificationBell: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const clientMatch = useMatch('/clients/:clientId/*')
  const clientRecordId = clientMatch?.params.clientId ? Number(clientMatch.params.clientId) : undefined

  return (
    <>
      <Button
        variant="outline"
        shape="square"
        size="md"
        icon={<Bell className="h-4 w-4" />}
        onClick={() => setDrawerOpen(true)}
        className="relative border-gray-200 text-gray-500 shadow-sm hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
        aria-label="הודעות"
        tooltip="הודעות"
      />
      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} clientRecordId={clientRecordId} />
    </>
  )
}
NotificationBell.displayName = 'NotificationBell'
