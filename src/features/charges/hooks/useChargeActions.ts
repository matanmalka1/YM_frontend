import { useCallback, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { workQueueQK } from '@/features/workQueue/api'
import { chargesApi, chargesQK, type BulkChargeActionPayload } from '../api'
import { runChargeActionRequest } from '../helpers'
import type { ChargeAction } from '../types'

type UseChargeActionsOptions = {
  clearSelection: () => void
  isAdvisor: boolean
  selectedIds: Set<number>
}

export const useChargeActions = ({ clearSelection, isAdvisor, selectedIds }: UseChargeActionsOptions) => {
  const queryClient = useQueryClient()
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  const actionMutation = useMutation({
    mutationFn: ({ action, chargeId }: { action: ChargeAction; chargeId: number }) =>
      runChargeActionRequest(chargeId, action),
    onSuccess: async () => {
      toast.success('פעולת חיוב בוצעה בהצלחה')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chargesQK.all }),
        queryClient.invalidateQueries({ queryKey: workQueueQK.all }),
      ])
    },
  })
  const { mutateAsync: runChargeActionMutation } = actionMutation

  const runAction = useCallback(
    async (chargeId: number, action: ChargeAction) => {
      if (!isAdvisor) {
        toast.error('אין הרשאה לבצע פעולת חיוב זו')
        return
      }

      try {
        setActionLoadingId(chargeId)
        await runChargeActionMutation({ action, chargeId })
      } catch (err: unknown) {
        showErrorToast(err, 'שגיאה בביצוע פעולת חיוב')
      } finally {
        setActionLoadingId(null)
      }
    },
    [isAdvisor, runChargeActionMutation],
  )

  const runBulkAction = useCallback(
    async (action: BulkChargeActionPayload['action'], cancellationReason?: string) => {
      if (!isAdvisor || selectedIds.size === 0) return
      setBulkLoading(true)
      try {
        const result = await chargesApi.bulkAction({
          charge_ids: Array.from(selectedIds),
          action,
          cancellation_reason: cancellationReason,
        })
        if (result.succeeded.length > 0) {
          toast.success(`${result.succeeded.length} חיובים עודכנו בהצלחה`)
        }
        if (result.failed.length > 0) {
          result.failed.forEach((f) => toast.error(`חיוב #${f.id}: ${f.error}`))
        }
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: chargesQK.all }),
          queryClient.invalidateQueries({ queryKey: workQueueQK.all }),
        ])
        clearSelection()
      } catch (err: unknown) {
        showErrorToast(err, 'שגיאה בביצוע פעולה מרובה')
      } finally {
        setBulkLoading(false)
      }
    },
    [clearSelection, isAdvisor, queryClient, selectedIds],
  )

  return {
    actionLoadingId,
    bulkLoading,
    runAction,
    runBulkAction,
  }
}
