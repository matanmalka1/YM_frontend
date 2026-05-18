import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { notificationsApi, notificationsQK } from '../api'

export const useNotificationBell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data } = useQuery({
    queryKey: notificationsQK.summary(),
    queryFn: () => notificationsApi.getSummary(),
    staleTime: 60_000,
    refetchInterval: drawerOpen ? 60_000 : 120_000,
    refetchOnWindowFocus: false,
  })

  const badgeCount = (data?.pending ?? 0) + (data?.failed ?? 0)
  const handleOpen = () => setDrawerOpen(true)
  const handleClose = () => setDrawerOpen(false)

  return { drawerOpen, badgeCount, handleOpen, handleClose }
}
