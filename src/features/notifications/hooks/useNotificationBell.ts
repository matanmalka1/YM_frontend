import { useState } from 'react'

export const useNotificationBell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const openDrawer = () => setDrawerOpen(true)
  const closeDrawer = () => setDrawerOpen(false)

  return { drawerOpen, openDrawer, closeDrawer }
}
