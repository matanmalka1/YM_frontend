import { useMemo } from 'react'
import { useAuthStore } from '../store/auth.store'
import type { UserRole } from '@/types'

export const getRoleCapabilities = (role: UserRole | null) => ({
  createClients: role === 'advisor',
  editClients: role === 'advisor',
  sendNotifications: role === 'advisor' || role === 'secretary',
  manageSignatureRequests: role === 'advisor' || role === 'secretary',
  createVatWorkItems: role === 'advisor' || role === 'secretary',
  addOrEditVatInvoices: role === 'advisor' || role === 'secretary',
  deleteVatInvoices: role === 'advisor',
  manageCharges: role === 'advisor' || role === 'secretary',
})

export const useRole = () => {
  const role = useAuthStore((s) => s.user?.role ?? null)

  return useMemo(
    () => ({
      role,
      isAdvisor: role === 'advisor',
      isSecretary: role === 'secretary',
      can: getRoleCapabilities(role),
    }),
    [role],
  )
}
