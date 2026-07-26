import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { randomUUID } from '@/utils/random'
import { showErrorToast } from '@/utils/utils'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'
import type { BulkGenerateFailedClient } from '../api/contracts'

export interface BulkGenerateTotals {
  clientsProcessed: number
  created: number
  skipped: number
  staleRemoved: number
  stalePending: number
  staleSettled: number
  failed: BulkGenerateFailedClient[]
}

const EMPTY_TOTALS: BulkGenerateTotals = {
  clientsProcessed: 0,
  created: 0,
  skipped: 0,
  staleRemoved: 0,
  stalePending: 0,
  staleSettled: 0,
  failed: [],
}

/**
 * Drives an office-wide annual generation, which the server splits into chunks.
 *
 * The loop is dumb on purpose: it repeats the call with whatever cursor came
 * back and stops when there is none. Which clients are in a chunk, and how big
 * a chunk is, are the server's decisions. Each chunk carries a key derived from
 * the run and its cursor, so retrying one chunk cannot create it twice.
 */
export const useBulkGenerateSchedule = (open: boolean) => {
  const queryClient = useQueryClient()
  const [totals, setTotals] = useState<BulkGenerateTotals | null>(null)

  const preview = useQuery({
    queryKey: advancedPaymentsQK.bulkGeneratePreview(),
    queryFn: advancePaymentsApi.bulkGeneratePreview,
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: async ({ year, cleanupStaleCadence = false }: { year: number; cleanupStaleCadence?: boolean }) => {
      const runId = randomUUID()
      let cursor: number | null = null
      let running: BulkGenerateTotals = EMPTY_TOTALS

      do {
        const chunk = await advancePaymentsApi.bulkGenerate(
          { year, cursor, cleanup_stale_cadence: cleanupStaleCadence },
          `${runId}:${cursor ?? 'start'}`,
        )
        running = {
          clientsProcessed: running.clientsProcessed + chunk.clients_processed,
          created: running.created + chunk.created,
          skipped: running.skipped + chunk.skipped,
          staleRemoved: running.staleRemoved + chunk.stale_cadence.removed,
          stalePending: running.stalePending + chunk.stale_cadence.pending,
          staleSettled: running.staleSettled + chunk.stale_cadence.settled,
          failed: [...running.failed, ...chunk.failed],
        }
        // Published per chunk so the progress bar advances during the run,
        // not only once every client is done.
        setTotals(running)
        cursor = chunk.next_cursor
      } while (cursor !== null)

      return running
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
    },
    onError: (err) => showErrorToast(err, ADVANCED_PAYMENTS_ERROR_MESSAGES.bulkGenerate.run),
  })

  // The modal is never unmounted, so a finished run would otherwise leave
  // isSuccess set and the generate button disabled the next time it opens.
  // Both the summary and the mutation's own state have to go.
  const { reset } = mutation
  useEffect(() => {
    if (open) {
      setTotals(null)
      reset()
    }
  }, [open, reset])

  return {
    isPreviewLoading: preview.isLoading,
    previewError: preview.error,
    eligibleCount: preview.data?.eligible_count ?? 0,
    ineligible: preview.data?.ineligible ?? [],
    totals,
    isRunning: mutation.isPending,
    isDone: mutation.isSuccess,
    generate: (year: number) => mutation.mutate({ year }),
    // Re-runs the whole office with the cleanup flag. Clients whose cadence did
    // not change are unaffected — their periods already exist and are skipped.
    confirmCleanup: (year: number) => mutation.mutate({ year, cleanupStaleCadence: true }),
  }
}
