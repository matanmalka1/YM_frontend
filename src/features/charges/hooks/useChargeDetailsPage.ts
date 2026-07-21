import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workQueueQK } from '@/features/workQueue/api'
import { chargesApi, chargesQK, type UpdateChargePayload } from '../api'
import { toast } from '../../../utils/toast'
import { getErrorMessage, getHttpStatus, isPositiveInt, showErrorToast } from '../../../utils/utils'
import { useRole } from '../../../hooks/useRole'
import { runChargeActionRequest } from '../utils/chargeHelpers'
import type { ChargeAction } from '../types'
import { CHARGES_MESSAGES } from '../messages'
import { CHARGES_ERROR_MESSAGES } from '../errorMessages'

export const useChargeDetailsPage = (chargeId: string | undefined) => {
  const queryClient = useQueryClient()
  const [denied, setDenied] = useState(false)

  const chargeIdNumber = Number(chargeId || 0)
  const hasValidChargeId = isPositiveInt(chargeIdNumber)
  const { isAdvisor, isSecretary } = useRole()

  const {
    data: chargeData,
    error: chargeError,
    isPending,
  } = useQuery({
    enabled: hasValidChargeId,
    queryKey: chargesQK.detail(chargeIdNumber),
    queryFn: () => chargesApi.getById(chargeIdNumber),
  })

  // Reflect 403 from query into denied state
  const queryDenied = getHttpStatus(chargeError) === 403

  const actionMutation = useMutation({
    mutationFn: ({ action, reason }: { action: ChargeAction; reason?: string }) =>
      runChargeActionRequest(chargeIdNumber, action, reason),
    onSuccess: async () => {
      toast.success(CHARGES_MESSAGES.feedback.actionSuccess)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chargesQK.detail(chargeIdNumber) }),
        queryClient.invalidateQueries({ queryKey: chargesQK.lists() }),
        queryClient.invalidateQueries({ queryKey: workQueueQK.all }),
      ])
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateChargePayload) => chargesApi.update(chargeIdNumber, payload),
    onSuccess: async () => {
      toast.success(CHARGES_MESSAGES.feedback.updated)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chargesQK.detail(chargeIdNumber) }),
        queryClient.invalidateQueries({ queryKey: chargesQK.lists() }),
      ])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => chargesApi.delete(chargeIdNumber),
    onSuccess: async () => {
      toast.success(CHARGES_MESSAGES.feedback.deleted)
      await queryClient.invalidateQueries({ queryKey: chargesQK.lists() })
    },
    onError: (err) => showErrorToast(err, CHARGES_ERROR_MESSAGES.mutations.delete),
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
      showErrorToast(err, CHARGES_ERROR_MESSAGES.mutations.action)
    }
  }

  const updateCharge = async (payload: UpdateChargePayload) => {
    try {
      await updateMutation.mutateAsync(payload)
      return true
    } catch {
      // Error surfaces inline in the edit modal via updateError.
      return false
    }
  }

  return {
    actionLoading: actionMutation.isPending,
    charge: chargeData ?? null,
    error: chargeError && !queryDenied ? getErrorMessage(chargeError, CHARGES_ERROR_MESSAGES.detail.load) : null,
    isLoading: isPending,
    denied: denied || queryDenied,
    runAction,
    deleteCharge: () => deleteMutation.mutateAsync(),
    isDeleting: deleteMutation.isPending,
    updateCharge,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error ? getErrorMessage(updateMutation.error, CHARGES_ERROR_MESSAGES.mutations.update) : null,
    isAdvisor: isAdvisor || isSecretary,
  }
}
