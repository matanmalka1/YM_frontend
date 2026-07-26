import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from '@/utils/toast'
import { showErrorToast } from '@/utils/utils'
import { advancePaymentsApi } from '../api'
import { ADVANCED_PAYMENTS_MESSAGES } from '../messages'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'
import type { StaleCadenceSummary } from '../api/contracts'

interface ScheduleGenerationOptions {
  year: number
  onGenerated: () => void
}

/**
 * Single-client schedule generation, including the frequency-change confirmation.
 *
 * A client whose reporting frequency changed still holds rows of the old cadence
 * that occupy the periods the new schedule needs. The server refuses to generate
 * a half-migrated year: it reports those rows and creates nothing. This hook
 * surfaces that report as `staleCadence` and re-runs with the cleanup flag once
 * the user confirms, so deleting rows is always something they agreed to.
 */
export const useScheduleGeneration = ({ year, onGenerated }: ScheduleGenerationOptions) => {
  const [staleCadence, setStaleCadence] = useState<StaleCadenceSummary | null>(null)
  const [pendingClientRecordId, setPendingClientRecordId] = useState<number | null>(null)

  const mutation = useMutation({
    mutationFn: (variables: { clientRecordId: number; periodMonthsCount: 1 | 2; cleanup: boolean }) =>
      advancePaymentsApi.generateSchedule({
        clientRecordId: variables.clientRecordId,
        year,
        periodMonthsCount: variables.periodMonthsCount,
        cleanupStaleCadence: variables.cleanup,
      }),
    onSuccess: (data, variables) => {
      if (data.stale_cadence.pending > 0) {
        // Nothing was written — hold the run open on the confirmation instead of
        // reporting a success that did not happen.
        setStaleCadence(data.stale_cadence)
        setPendingClientRecordId(variables.clientRecordId)
        return
      }
      setStaleCadence(null)
      setPendingClientRecordId(null)
      toast.success(
        ADVANCED_PAYMENTS_MESSAGES.generateScheduleModal.result({
          created: data.created,
          skipped: data.skipped,
          removed: data.stale_cadence.removed,
          settled: data.stale_cadence.settled,
        }),
      )
      onGenerated()
    },
    onError: (err) => showErrorToast(err, ADVANCED_PAYMENTS_ERROR_MESSAGES.generateSchedule.create),
  })

  const generate = (clientRecordId: number, periodMonthsCount: 1 | 2) => {
    setStaleCadence(null)
    mutation.mutate({ clientRecordId, periodMonthsCount, cleanup: false })
  }

  const confirmCleanup = (periodMonthsCount: 1 | 2) => {
    if (pendingClientRecordId === null) return
    mutation.mutate({ clientRecordId: pendingClientRecordId, periodMonthsCount, cleanup: true })
  }

  const dismissStaleCadence = () => {
    setStaleCadence(null)
    setPendingClientRecordId(null)
  }

  // Stable identity: callers put `reset` in an effect's deps, and resetting the
  // mutation notifies react-query — a fresh arrow each render would make that
  // effect re-run on its own output, forever.
  const { reset: resetMutation } = mutation
  const reset = useCallback(() => {
    setStaleCadence(null)
    setPendingClientRecordId(null)
    resetMutation()
  }, [resetMutation])

  return {
    generate,
    confirmCleanup,
    dismissStaleCadence,
    staleCadence,
    isPending: mutation.isPending,
    reset,
  }
}
