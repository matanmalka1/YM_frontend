import { useCallback, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { workQueueQK } from '@/features/workQueue/api'
import { chargesApi, chargesQK, type BulkChargeActionPayload } from '../api'
import { runChargeActionRequest } from '../utils/chargeHelpers'
import type { ChargeAction } from '../types'
import { CHARGES_MESSAGES } from '../messages'
import { CHARGES_ERROR_MESSAGES } from '../errorMessages'

type UseChargeActionsOptions = {
  clearSelection: () => void
  canAct: boolean
  selectedIds: Set<number>
}

export const useChargeActions = ({ clearSelection, canAct, selectedIds }: UseChargeActionsOptions) => {
  const queryClient = useQueryClient()
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  const actionMutation = useMutation({
    mutationFn: ({ action, chargeId }: { action: ChargeAction; chargeId: number }) => runChargeActionRequest(chargeId, action),
    onSuccess: async () => {
      toast.success(CHARGES_MESSAGES.feedback.actionSuccess)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chargesQK.all }),
        queryClient.invalidateQueries({ queryKey: workQueueQK.all }),
      ])
    },
  })
  const { mutateAsync: runChargeActionMutation } = actionMutation

  const runAction = useCallback(
    async (chargeId: number, action: ChargeAction) => {
      if (!canAct) {
        toast.error(CHARGES_ERROR_MESSAGES.permissions.action)
        return
      }

      try {
        setActionLoadingId(chargeId)
        await runChargeActionMutation({ action, chargeId })
      } catch (err: unknown) {
        showErrorToast(err, CHARGES_ERROR_MESSAGES.mutations.chargeAction)
      } finally {
        setActionLoadingId(null)
      }
    },
    [canAct, runChargeActionMutation],
  )

  const runBulkAction = useCallback(
    async (action: BulkChargeActionPayload['action'], cancellationReason?: string) => {
      if (!canAct || selectedIds.size === 0) return
      setBulkLoading(true)
      try {
        const result = await chargesApi.bulkAction({
          charge_ids: Array.from(selectedIds),
          action,
          cancellation_reason: cancellationReason,
        })
        if (result.succeeded.length > 0) {
          toast.success(CHARGES_MESSAGES.feedback.bulkSuccess(result.succeeded.length))
        }
        if (result.failed.length > 0) {
          result.failed.forEach((f) => toast.error(CHARGES_ERROR_MESSAGES.bulk.itemFailure(f.id, f.error)))
        }
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: chargesQK.all }),
          queryClient.invalidateQueries({ queryKey: workQueueQK.all }),
        ])
        clearSelection()
      } catch (err: unknown) {
        showErrorToast(err, CHARGES_ERROR_MESSAGES.mutations.bulkAction)
      } finally {
        setBulkLoading(false)
      }
    },
    [clearSelection, canAct, queryClient, selectedIds],
  )

  return {
    actionLoadingId,
    bulkLoading,
    runAction,
    runBulkAction,
  }
}
