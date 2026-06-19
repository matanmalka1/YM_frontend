import type { AdvancePaymentDueDateGroup } from '../api/contracts'
import { reportingPeriodIncludesMonth } from '@/utils/reportingPeriod'

export const getAdvancePaymentBatchKey = (batch: AdvancePaymentDueDateGroup): string =>
  batch.due_date ?? `${batch.year}-${String(batch.month).padStart(2, '0')}-${batch.period_months_count}`

const safeCount = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

const safeAmount = (value: unknown): number => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

const calculateCollectionRate = (totalPaid: number, totalExpected: number): string =>
  totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(2) : '0'

export const mergeAdvancePaymentBatches = (
  batches: AdvancePaymentDueDateGroup[],
  periodFilter: 1 | 2 | null,
): AdvancePaymentDueDateGroup[] => {
  const canonicalBatches = batches.filter((batch) => batch.period_months_count !== 2 || batch.month % 2 === 1)
  const filteredBatches =
    periodFilter === null
      ? canonicalBatches
      : canonicalBatches.filter((batch) => batch.period_months_count === periodFilter)
  const batchesByKey = new Map<string, AdvancePaymentDueDateGroup>()

  for (const batch of filteredBatches) {
    const key = getAdvancePaymentBatchKey(batch)
    const existing = batchesByKey.get(key)
    if (!existing) {
      batchesByKey.set(key, { ...batch, source_batches: [batch] })
      continue
    }

    const totalExpected = safeAmount(existing.total_expected) + safeAmount(batch.total_expected)
    const totalPaid = safeAmount(existing.total_paid) + safeAmount(batch.total_paid)
    batchesByKey.set(key, {
      ...existing,
      source_batches: [...(existing.source_batches ?? [existing]), batch],
      client_count: existing.client_count + batch.client_count,
      pending_count: existing.pending_count + batch.pending_count,
      overdue_count: existing.overdue_count + batch.overdue_count,
      missing_turnover_count: existing.missing_turnover_count + batch.missing_turnover_count,
      total_expected: String(totalExpected),
      total_paid: String(totalPaid),
      collection_rate: calculateCollectionRate(totalPaid, totalExpected),
    })
  }

  return [...batchesByKey.values()].sort((first, second) => {
    const firstKey = first.due_date ?? `${first.year}-${String(first.month).padStart(2, '0')}`
    const secondKey = second.due_date ?? `${second.year}-${String(second.month).padStart(2, '0')}`
    return firstKey.localeCompare(secondKey)
  })
}

export const getAdvancePaymentWorkflowStats = (
  batches: AdvancePaymentDueDateGroup[],
  currentYear: number,
  currentMonth: number,
) =>
  batches.reduce(
    (stats, batch) => {
      if (reportingPeriodIncludesMonth(batch.year, batch.month, batch.period_months_count, currentYear, currentMonth)) {
        stats.dueThisMonthCount += safeCount(batch.not_paid_count)
      }

      stats.pendingCount += safeCount(batch.pending_count)
      stats.missingTurnoverCount += safeCount(batch.missing_turnover_count)
      stats.overdueCount += safeCount(batch.overdue_count)
      return stats
    },
    { dueThisMonthCount: 0, pendingCount: 0, missingTurnoverCount: 0, overdueCount: 0 },
  )
