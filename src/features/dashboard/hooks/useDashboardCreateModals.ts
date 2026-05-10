import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { chargesApi, chargesQK, type CreateChargePayload } from '@/features/charges'
import { CLIENT_ROUTES, clientsApi, clientsQK, extractClientErrorCode } from '@/features/clients'
import { vatReportsApi, vatReportsQK, type CreateVatWorkItemPayload } from '@/features/vatReports'
import { getErrorMessage, showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { dashboardQK } from '../api/queryKeys'

export type DashboardCreateModal = 'charge' | 'client' | 'vat'

type DeletedClientInfo = {
  id: number
  full_name: string
  id_number: string
  deleted_at: string
}

export const useDashboardCreateModals = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeCreateModal, setActiveCreateModal] = useState<DashboardCreateModal | null>(null)
  const [deletedClientInfo, setDeletedClientInfo] = useState<DeletedClientInfo | null>(null)

  const invalidateDashboardData = async () => {
    await queryClient.invalidateQueries({ queryKey: dashboardQK.all })
  }

  const chargeCreateMutation = useMutation({
    mutationFn: (payload: CreateChargePayload) => chargesApi.create(payload),
    onSuccess: async () => {
      toast.success('חיוב נוצר בהצלחה')
      await Promise.all([queryClient.invalidateQueries({ queryKey: chargesQK.all }), invalidateDashboardData()])
    },
  })

  const vatCreateMutation = useMutation({
    mutationFn: (payload: CreateVatWorkItemPayload) => vatReportsApi.create(payload),
    onSuccess: async () => {
      toast.success('תיק מע"מ נוצר בהצלחה')
      await Promise.all([queryClient.invalidateQueries({ queryKey: vatReportsQK.all }), invalidateDashboardData()])
    },
  })

  const clientCreateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof clientsApi.create>[0]) => clientsApi.create(payload),
    onSuccess: async (data) => {
      const summary = data.impact.items.map((item) => `${item.label}: ${item.count}`).join(' | ')
      toast.success(`לקוח נוצר בהצלחה\n${summary}`)
      setDeletedClientInfo(null)
      await Promise.all([queryClient.invalidateQueries({ queryKey: clientsQK.all }), invalidateDashboardData()])
    },
    onError: async (err, payload) => {
      if (extractClientErrorCode(err) !== 'CLIENT.DELETED_EXISTS') {
        showErrorToast(err, 'שגיאה ביצירת לקוח')
        return
      }
      try {
        const deleted = await clientsApi.getConflictByIdNumber(payload.id_number)
        setDeletedClientInfo(deleted.deleted_clients[0] ?? null)
      } catch {
        showErrorToast(err, 'שגיאה ביצירת לקוח')
      }
    },
  })

  const restoreClientMutation = useMutation({
    mutationFn: (clientId: number) => clientsApi.restore(clientId),
    onSuccess: async (client) => {
      toast.success('הלקוח שוחזר בהצלחה')
      setDeletedClientInfo(null)
      setActiveCreateModal(null)
      await Promise.all([queryClient.invalidateQueries({ queryKey: clientsQK.all }), invalidateDashboardData()])
      navigate(CLIENT_ROUTES.detail(client.id))
    },
    onError: (err) => showErrorToast(err, 'שגיאה בשחזור לקוח'),
  })

  const closeCreateModal = () => setActiveCreateModal(null)

  const submitChargeCreate = async (payload: CreateChargePayload): Promise<boolean> => {
    try {
      await chargeCreateMutation.mutateAsync(payload)
      return true
    } catch (err) {
      showErrorToast(err, 'שגיאה ביצירת חיוב')
      return false
    }
  }

  const submitVatCreate = async (payload: CreateVatWorkItemPayload): Promise<boolean> => {
    try {
      await vatCreateMutation.mutateAsync(payload)
      return true
    } catch (err) {
      showErrorToast(err, 'שגיאה ביצירת תיק מע"מ')
      return false
    }
  }

  const submitClientCreate = async (payload: Parameters<typeof clientsApi.create>[0]): Promise<void> => {
    await clientCreateMutation.mutateAsync(payload)
  }

  return {
    activeCreateModal,
    setActiveCreateModal,
    deletedClientInfo,
    setDeletedClientInfo,
    closeCreateModal,
    chargeCreateMutation,
    vatCreateMutation,
    clientCreateMutation,
    restoreClientMutation,
    submitChargeCreate,
    submitVatCreate,
    submitClientCreate,
    chargeCreateError: chargeCreateMutation.error
      ? getErrorMessage(chargeCreateMutation.error, 'שגיאה ביצירת חיוב')
      : null,
    vatCreateError: vatCreateMutation.error
      ? getErrorMessage(vatCreateMutation.error, 'שגיאה ביצירת תיק מע"מ')
      : null,
  }
}
