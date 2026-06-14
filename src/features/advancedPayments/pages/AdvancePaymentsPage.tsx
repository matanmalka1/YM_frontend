import { useCallback, useMemo, useState } from 'react'
import { getYear } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusCircle, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/primitives/Button'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { MonthlyAccordionList } from '@/components/ui/table/MonthlyAccordionGroup'
import { useDefaultOpenGroup } from '@/hooks/useDefaultOpenGroup'
import { useAdvancePaymentBatches } from '../hooks/useAdvancePaymentBatches'
import { OverviewKPICards } from '../components/OverviewKPICards'
import { AdvancePaymentBatchRow } from '../components/AdvancePaymentBatchRow'
import { AdvancePaymentDrawer } from '../components/AdvancePaymentDrawer'
import { CreateAdvancePaymentFlow } from '../components/CreateAdvancePaymentFlow'
import { GenerateScheduleModal } from '../components/GenerateScheduleModal'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type {
  AdvancePaymentDueDateGroup,
  AdvancePaymentOverviewRow,
  UpdateAdvancePaymentPayload,
  AdvancePaymentStatus,
} from '../types'
import { ADVANCE_PAYMENT_STATUS_OPTIONS_WITH_ALL } from '../constants'
import { parsePositiveInt } from '@/utils/utils'
import { toast } from '../../../utils/toast'
import { showErrorToast } from '../../../utils/utils'
import { useRole } from '../../../hooks/useRole'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { getOperationalTaxYear, getOperationalYearOptions } from '@/constants/periodOptions.constants'
import { reportingPeriodIncludesMonth } from '@/utils/reportingPeriod'

const PERIOD_OPTIONS = [
  { value: '', label: 'כל הסוגים' },
  { value: '1', label: 'חודשי' },
  { value: '2', label: 'דו-חודשי' },
]

const YEAR_OPTIONS = [{ value: 'all', label: 'כל השנים' }, ...getOperationalYearOptions()]

const FILTER_FIELDS = [
  { type: 'client-picker' as const, idKey: 'client_record_id', nameKey: 'client_name', label: 'לקוח' },
  {
    type: 'select' as const,
    key: 'year',
    label: 'שנה',
    options: YEAR_OPTIONS,
    defaultValue: String(getOperationalTaxYear()),
  },
  {
    type: 'select' as const,
    key: 'status',
    label: 'סטטוס',
    options: ADVANCE_PAYMENT_STATUS_OPTIONS_WITH_ALL,
  },
  { type: 'select' as const, key: 'period', label: 'תקופת מקדמה', options: PERIOD_OPTIONS },
]

const getBatchStableKey = (batch: AdvancePaymentDueDateGroup): string =>
  batch.due_date ?? `${batch.year}-${String(batch.month).padStart(2, '0')}-${batch.period_months_count}`

const safeCount = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

export const AdvancePayments: React.FC = () => {
  const { searchParams, setSearchParams, setFilter, setFilters, resetFilters } = useSearchParamFilters()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAdvisor } = useRole()

  const todayYear = getYear(new Date())
  const rawYear = searchParams.get('year') ?? String(getOperationalTaxYear())
  const year: number | null = rawYear === 'all' ? null : parsePositiveInt(rawYear, todayYear)

  const [drawerRow, setDrawerRow] = useState<AdvancePaymentOverviewRow | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [genOpen, setGenOpen] = useState(false)

  const rawPeriod = searchParams.get('period') ?? ''
  const filters = {
    client_record_id: searchParams.get('client_record_id') ?? '',
    client_name: searchParams.get('client_name') ?? '',
    status: searchParams.get('status') ?? '',
    period: rawPeriod === '1' || rawPeriod === '2' ? rawPeriod : '',
  }

  const clientRecordId = filters.client_record_id ? Number(filters.client_record_id) : undefined
  const { batches, isLoading } = useAdvancePaymentBatches(year, clientRecordId)

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'year') {
      const next = new URLSearchParams(searchParams)
      next.set('year', value)
      setSearchParams(next)
      return
    }
    setFilter(key, value)
  }

  const handleMultiFilterChange = (updates: Record<string, string>) => {
    setFilters(updates, false)
  }

  const handleFilterReset = () => {
    resetFilters()
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAdvancePaymentPayload }) =>
      advancePaymentsApi.update(drawerRow!.client_record_id, id, payload),
    onSuccess: () => {
      toast.success('מקדמה עודכנה')
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
      setDrawerRow(null)
    },
    onError: (err) => showErrorToast(err, 'שגיאה בעדכון מקדמה'),
  })

  const handleSave = async (id: number, payload: UpdateAdvancePaymentPayload) => {
    await updateMutation.mutateAsync({ id, payload })
  }

  const handleRowClick = (row: AdvancePaymentOverviewRow) => {
    if (isAdvisor) {
      setDrawerRow(row)
    } else {
      navigate(`/clients/${row.client_record_id}/advance-payments`)
    }
  }

  const periodFilter = filters.period === '' ? null : (Number(filters.period) as 1 | 2)
  const statusFilter = filters.status as AdvancePaymentStatus | ''

  const displayBatches = useMemo(() => {
    const canonicalBatches = batches.filter((b) => b.period_months_count !== 2 || b.month % 2 === 1)
    const filteredBatches =
      periodFilter === null ? canonicalBatches : canonicalBatches.filter((b) => b.period_months_count === periodFilter)
    const map = new Map<string, (typeof filteredBatches)[0]>()
    // Group by due_date when available (merges bimonthly source batches sharing the same deadline).
    // Fall back to a stable period key so batches with no due_date never collapse into one row.
    const groupKey = (batch: (typeof filteredBatches)[0]) =>
      batch.due_date ?? `${batch.year}-${String(batch.month).padStart(2, '0')}-${batch.period_months_count}`

    for (const b of filteredBatches) {
      const key = groupKey(b)
      const existing = map.get(key)
      if (existing) {
        map.set(key, {
          ...existing,
          source_batches: [...(existing.source_batches ?? [existing]), b],
          client_count: existing.client_count + b.client_count,
          pending_count: existing.pending_count + b.pending_count,
          overdue_count: existing.overdue_count + b.overdue_count,
          missing_turnover_count: existing.missing_turnover_count + b.missing_turnover_count,
          total_expected: String(Number(existing.total_expected ?? 0) + Number(b.total_expected ?? 0)),
          total_paid: String(Number(existing.total_paid ?? 0) + Number(b.total_paid ?? 0)),
        })
      } else {
        map.set(key, { ...b, source_batches: [b] })
      }
    }
    return [...map.values()].sort((a, b) => {
      const aKey = a.due_date ?? `${a.year}-${String(a.month).padStart(2, '0')}`
      const bKey = b.due_date ?? `${b.year}-${String(b.month).padStart(2, '0')}`
      return aKey.localeCompare(bKey)
    })
  }, [batches, periodFilter])

  const defaultOpenBatchKey = useDefaultOpenGroup(
    displayBatches,
    useCallback((b) => getBatchStableKey(b), []),
    useCallback((b) => b.due_date ?? null, []),
  )

  const workflowStats = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    return displayBatches.reduce(
      (stats, batch) => {
        if (
          reportingPeriodIncludesMonth(batch.year, batch.month, batch.period_months_count, currentYear, currentMonth)
        ) {
          stats.dueThisMonthCount += safeCount(batch.not_paid_count)
        }

        stats.pendingCount += safeCount(batch.pending_count)
        stats.missingTurnoverCount += safeCount(batch.missing_turnover_count)
        stats.overdueCount += safeCount(batch.overdue_count)
        return stats
      },
      { dueThisMonthCount: 0, pendingCount: 0, missingTurnoverCount: 0, overdueCount: 0 },
    )
  }, [displayBatches])

  const currentReportingDate = new Date()
  const currentReportingYear = currentReportingDate.getFullYear()
  const currentReportingMonth = currentReportingDate.getMonth() + 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="מקדמות מס הכנסה"
        description="מעקב שנתי אחר תשלומים, פיגורים וגבייה"
        actions={
          isAdvisor ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setGenOpen(true)}>
                צור לוח שנתי
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)}>
                הוסף מקדמה
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          ) : undefined
        }
      />

      <OverviewKPICards
        dueThisMonthCount={workflowStats.dueThisMonthCount}
        pendingCount={workflowStats.pendingCount}
        missingTurnoverCount={workflowStats.missingTurnoverCount}
        overdueCount={workflowStats.overdueCount}
      />

      <FilterPanel
        fields={FILTER_FIELDS}
        values={{ ...filters, year: year === null ? 'all' : String(year) }}
        onChange={handleFilterChange}
        onMultiChange={handleMultiFilterChange}
        onReset={handleFilterReset}
        gridClass="grid-cols-1 sm:grid-cols-4"
      />

      <MonthlyAccordionList
        isLoading={isLoading}
        isEmpty={!isLoading && batches.length === 0}
        emptyState={{ message: year === null ? 'אין מקדמות' : `אין מקדמות לשנה ${year}` }}
        skeletonCols={11}
      >
        {displayBatches.map((batch) => {
          const stableKey = getBatchStableKey(batch)
          const isDefaultOpen = stableKey === defaultOpenBatchKey
          const isCurrentPeriod = reportingPeriodIncludesMonth(
            batch.year,
            batch.month,
            batch.period_months_count,
            currentReportingYear,
            currentReportingMonth,
          )
          return (
            <AdvancePaymentBatchRow
              key={stableKey}
              batch={batch}
              defaultOpen={isDefaultOpen}
              isCurrentPeriod={isCurrentPeriod}
              clientRecordId={clientRecordId}
              statusFilter={statusFilter}
              periodFilter={periodFilter}
              onRowClick={handleRowClick}
            />
          )
        })}
      </MonthlyAccordionList>

      <AdvancePaymentDrawer
        row={drawerRow}
        open={drawerRow !== null}
        isUpdating={updateMutation.isPending}
        canEdit={isAdvisor}
        onClose={() => setDrawerRow(null)}
        onSave={handleSave}
      />

      <CreateAdvancePaymentFlow open={createOpen} year={year ?? todayYear} onClose={() => setCreateOpen(false)} />

      <GenerateScheduleModal open={genOpen} year={year ?? todayYear} onClose={() => setGenOpen(false)} />
    </div>
  )
}
