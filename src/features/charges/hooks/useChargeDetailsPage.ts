import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workQueueQK } from '@/features/workQueue/api'
import { chargesApi, chargesQK } from '../api'
import { toast } from '../../../utils/toast'
import { getHttpStatus, isPositiveInt, showErrorToast } from '../../../utils/utils'
import { useRole } from '../../../hooks/useRole'
import { runChargeActionRequest } from '../utils/chargeHelpers'
import type { ChargeAction } from '../types'

export const useChargeDetailsPage = (chargeId: string | undefined) => {
  const queryClient = useQueryClient()
  const [denied, setDenied] = useState(false)

  const chargeIdNumber = Number(chargeId || 0)
  const hasValidChargeId = isPositiveInt(chargeIdNumber)
  const { isAdvisor, isSecretary } = useRole()

  const chargeQuery = useQuery({
    enabled: hasValidChargeId,
    queryKey: chargesQK.detail(chargeIdNumber),
    queryFn: () => chargesApi.getById(chargeIdNumber),
  })

  // Reflect 403 from query into denied state
  const queryDenied = getHttpStatus(chargeQuery.error) === 403

  const actionMutation = useMutation({
    mutationFn: ({ action, reason }: { action: ChargeAction; reason?: string }) =>
      runChargeActionRequest(chargeIdNumber, action, reason),
    onSuccess: async () => {
      toast.success('פעולת חיוב בוצעה בהצלחה')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chargesQK.detail(chargeIdNumber) }),
        queryClient.invalidateQueries({ queryKey: chargesQK.lists() }),
        queryClient.invalidateQueries({ queryKey: workQueueQK.all }),
      ])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => chargesApi.delete(chargeIdNumber),
    onSuccess: async () => {
      toast.success('החיוב נמחק בהצלחה')
      await queryClient.invalidateQueries({ queryKey: chargesQK.lists() })
    },
    onError: (err) => showErrorToast(err, 'שגיאה במחיקת חיוב'),
  })

  const runAction = async (action: ChargeAction, reason?: string) => {
    if (!hasValidChargeId || (!isAdvisor && !isSecretary)) {
      setDenied(true)
      return
    }
    try {
      setDenied(false)
      await actionMutation.mutateAsync({ action, reason })
    } catch (err: unknown) {
      if (getHttpStatus(err) === 403) setDenied(true)
      showErrorToast(err, 'שגיאה בביצוע פעולה')
    }
  }

  return {
    actionLoading: actionMutation.isPending,
    charge: chargeQuery.data ?? null,
    denied: denied || queryDenied,
    runAction,
    deleteCharge: () => deleteMutation.mutateAsync(),
    isDeleting: deleteMutation.isPending,
    isAdvisor: isAdvisor || isSecretary,
  }
}
