import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { vatReportsApi } from '../api'
import { toast } from '../../../utils/toast'
import { showErrorToast } from '../../../utils/utils'
import { invalidateVatWorkItem } from './useVatInvalidation'
import { VAT_MESSAGES } from '../messages'

// After a status-changing action succeeds, the set of available actions (and their
// labels/positions) can change in the same render. Keep actions disabled briefly so a
// near-immediate second click can't land on a different action that just appeared
// in the same spot.
const ACTION_CHANGE_COOLDOWN_MS = 1500

export const useVatWorkItemActions = (workItemId: number) => {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [coolingDown, setCoolingDown] = useState(false)
  const cooldownTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current !== null) window.clearTimeout(cooldownTimerRef.current)
    }
  }, [])

  const run = async (
    fn: () => ReturnType<typeof vatReportsApi.markMaterialsComplete>,
    successMsg: string,
    errMsg: string,
  ) => {
    setLoading(true)
    try {
      const workItem = await fn()
      toast.success(successMsg)
      await invalidateVatWorkItem(queryClient, {
        workItemId: workItem.id,
        clientRecordId: workItem.client_record_id,
      })
      setCoolingDown(true)
      if (cooldownTimerRef.current !== null) window.clearTimeout(cooldownTimerRef.current)
      cooldownTimerRef.current = window.setTimeout(() => {
        setCoolingDown(false)
        cooldownTimerRef.current = null
      }, ACTION_CHANGE_COOLDOWN_MS)
    } catch (err) {
      showErrorToast(err, errMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleMaterialsComplete = () =>
    run(
      () => vatReportsApi.markMaterialsComplete(workItemId),
      VAT_MESSAGES.mutations.materialsConfirmed,
      VAT_MESSAGES.mutations.statusChangeError,
    )

  const handleReadyForReview = () =>
    run(
      () => vatReportsApi.markReadyForReview(workItemId),
      VAT_MESSAGES.mutations.readyForReview,
      VAT_MESSAGES.mutations.statusChangeError,
    )

  const handleSendBack = (note: string) =>
    run(
      () => vatReportsApi.sendBack(workItemId, note),
      VAT_MESSAGES.mutations.sendBackSuccess,
      VAT_MESSAGES.page.sendBackError,
    )

  return {
    handleMaterialsComplete,
    handleReadyForReview,
    handleSendBack,
    isLoading: loading,
    isCoolingDown: coolingDown,
  }
}
