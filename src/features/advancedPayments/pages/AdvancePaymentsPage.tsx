import { useState, useMemo } from 'react'
import { getYear, getMonth } from 'date-fns'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusCircle, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Modal } from '@/components/ui/overlays/Modal'
import { Button } from '@/components/ui/primitives/Button'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { MonthlyAccordionList } from '@/components/ui/table/MonthlyAccordionGroup'
import { ClientPickerField } from '@/components/shared/client/ClientPickerField'
import { useClientPickerState } from '@/components/shared/client/useClientPickerState'
import { useAdvancePaymentBatches } from '../hooks/useAdvancePaymentBatches'
import { OverviewKPICards } from '../components/OverviewKPICards'
import { AdvancePaymentBatchRow } from '../components/AdvancePaymentBatchRow'
import { AdvancePaymentDrawer } from '../components/AdvancePaymentDrawer'
import { CreateAdvancePaymentModal } from '../components/CreateAdvancePaymentModal'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type {
  AdvancePaymentOverviewRow,
  UpdateAdvancePaymentPayload,
  AdvancePaymentStatus,
  CreateAdvancePaymentPayload,
} from '../types'
import { ADVANCE_PAYMENT_STATUS_OPTIONS_WITH_ALL } from '../constants'
import { getAdvancePaymentDueDateFallback } from '../utils'
import { parsePositiveInt } from '@/utils/utils'
import { toast } from '../../../utils/toast'
import { showErrorToast } from '../../../utils/utils'
import { useRole } from '../../../hooks/useRole'
import { getOperationalTaxYear, getOperationalYearOptions } from '@/constants/periodOptions.constants'
import { useTaxProfile } from '@/features/taxProfile'

const PERIOD_OPTIONS = [
  { value: '', label: 'כל הסוגים' },
  { value: '1', label: 'חודשי' },
  { value: '2', label: 'דו-חודשי' },
]

const FILTER_FIELDS = [
  { type: 'client-picker' as const, idKey: 'client_id', nameKey: 'client_name', label: 'לקוח' },
  {
    type: 'select' as const,
    key: 'year',
    label: 'שנה',
    options: getOperationalYearOptions(),
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

export const AdvancePayments: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAdvisor } = useRole()

  const today = new Date()
  const todayYear = getYear(today)
  const todayMonth = getMonth(today) + 1
  const year = parsePositiveInt(searchParams.get('year'), todayYear)

  const [drawerRow, setDrawerRow] = useState<AdvancePaymentOverviewRow | null>(null)
  const [filters, setFilters] = useState({ client_id: '', client_name: '', status: '', period: '' })

  const [createPickerOpen, setCreatePickerOpen] = useState(false)
  const [createClientId, setCreateClientId] = useState<number | null>(null)
  const createPicker = useClientPickerState({
    onSelect: (c) => setCreateClientId(c.id),
    onClear: () => setCreateClientId(null),
  })

  const [genPickerOpen, setGenPickerOpen] = useState(false)
  const genPicker = useClientPickerState()

  const genClientId = genPicker.selectedClient?.id ?? 0
  const { profile: genProfile, isLoading: isGenProfileLoading, error: genProfileError } = useTaxProfile(genClientId)
  const isGenProfileError = genProfileError !== null && genClientId > 0

  const generationFrequency: 1 | 2 | null =
    genClientId === 0
      ? null
      : genProfile?.advance_payment_frequency === 'bimonthly'
        ? 2
        : genProfile?.advance_payment_frequency === 'monthly'
          ? 1
          : null

  const { batches, isLoading } = useAdvancePaymentBatches(year)

  const totalExpected = batches.reduce((s, b) => s + Number(b.total_expected ?? 0), 0)
  const totalPaid = batches.reduce((s, b) => s + Number(b.total_paid ?? 0), 0)
  const collectionRate = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0
  const overdueTotal = batches.reduce((s, b) => s + b.overdue_count, 0)

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'year') {
      const next = new URLSearchParams(searchParams)
      next.set('year', value)
      setSearchParams(next)
      return
    }
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleMultiFilterChange = (updates: Record<string, string>) => {
    const yearUpdate = updates['year']
    if (yearUpdate !== undefined) {
      const next = new URLSearchParams(searchParams)
      next.set('year', yearUpdate)
      setSearchParams(next)
    }
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  const handleFilterReset = () => {
    setFilters({ client_id: '', client_name: '', status: '', period: '' })
    const next = new URLSearchParams(searchParams)
    next.delete('year')
    setSearchParams(next)
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

  const createMutation = useMutation({
    mutationFn: (payload: CreateAdvancePaymentPayload) => advancePaymentsApi.create(createClientId!, payload),
    onSuccess: () => {
      toast.success('מקדמה נוצרה')
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
      setCreatePickerOpen(false)
      setCreateClientId(null)
      createPicker.resetClientPicker()
    },
    onError: (err) => showErrorToast(err, 'שגיאה ביצירת מקדמה'),
  })

  const generateMutation = useMutation({
    mutationFn: (periodMonthsCount: 1 | 2) =>
      advancePaymentsApi.generateSchedule(genClientId, year, periodMonthsCount),
    onSuccess: (data) => {
      toast.success(data.created > 0 ? `נוצרו ${data.created} מקדמות, דולגו ${data.skipped}` : 'לא נוצרו מקדמות חדשות')
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
      setGenPickerOpen(false)
      genPicker.resetClientPicker()
    },
    onError: (err) => showErrorToast(err, 'שגיאה ביצירת לוח מקדמות'),
  })

  const handleGenerate = () => {
    if (genClientId === 0) {
      toast.error('לא נבחר לקוח תקין')
      return
    }
    if (isGenProfileLoading) {
      toast.error('פרופיל הלקוח עדיין נטען')
      return
    }
    if (isGenProfileError) {
      toast.error('שגיאה בטעינת פרופיל הלקוח')
      return
    }
    if (generationFrequency == null) {
      toast.error('לא ניתן ליצור לוח בלי תדירות מקדמות בפרופיל הלקוח')
      return
    }
    generateMutation.mutate(generationFrequency)
  }

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
    const getDueDate = (batch: (typeof filteredBatches)[0]) => {
      if (batch.due_date) return batch.due_date
      return getAdvancePaymentDueDateFallback(batch)
    }

    for (const b of filteredBatches) {
      const dueDate = getDueDate(b)
      const existing = map.get(dueDate)
      if (existing) {
        map.set(dueDate, {
          ...existing,
          due_date: dueDate,
          source_batches: [...(existing.source_batches ?? [existing]), b],
          client_count: existing.client_count + b.client_count,
          pending_count: existing.pending_count + b.pending_count,
          overdue_count: existing.overdue_count + b.overdue_count,
          missing_turnover_count: existing.missing_turnover_count + b.missing_turnover_count,
          total_expected: String(Number(existing.total_expected ?? 0) + Number(b.total_expected ?? 0)),
          total_paid: String(Number(existing.total_paid ?? 0) + Number(b.total_paid ?? 0)),
        })
      } else {
        map.set(dueDate, { ...b, due_date: dueDate, source_batches: [b] })
      }
    }
    return [...map.values()].sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))
  }, [batches, periodFilter])

  return (
    <div className="space-y-6">
      <PageHeader
        title="מקדמות מס הכנסה"
        description="מעקב שנתי אחר תשלומים, פיגורים וגבייה"
        actions={
          isAdvisor ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setGenPickerOpen(true)}>
                צור לוח שנתי
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCreatePickerOpen(true)}>
                הוסף מקדמה
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          ) : undefined
        }
      />

      <OverviewKPICards
        year={year}
        totalExpected={String(totalExpected)}
        totalPaid={String(totalPaid)}
        collectionRate={collectionRate}
        overdueCount={overdueTotal}
      />

      <FilterPanel
        fields={FILTER_FIELDS}
        values={{ ...filters, year: String(year) }}
        onChange={handleFilterChange}
        onMultiChange={handleMultiFilterChange}
        onReset={handleFilterReset}
        gridClass="grid-cols-1 sm:grid-cols-4"
      />

      <MonthlyAccordionList
        isLoading={isLoading}
        isEmpty={!isLoading && batches.length === 0}
        emptyState={{ message: `אין מקדמות לשנה ${year}` }}
        skeletonCols={11}
      >
        {displayBatches.map((batch) => {
          const dueDate = new Date(`${batch.due_date}T00:00:00`)
          const isCurrent = dueDate.getFullYear() === todayYear && dueDate.getMonth() + 1 === todayMonth
          return (
            <AdvancePaymentBatchRow
              key={batch.due_date}
              batch={batch}
              isCurrent={isCurrent}
              search={filters.client_name}
              statusFilter={statusFilter}
              periodFilter={periodFilter}
              onRowClick={handleRowClick}
            />
          )
        })}
      </MonthlyAccordionList>

      {/* Drawer */}
      <AdvancePaymentDrawer
        row={drawerRow as never}
        open={drawerRow !== null}
        isUpdating={updateMutation.isPending}
        canEdit={isAdvisor}
        onClose={() => setDrawerRow(null)}
        onSave={handleSave}
      />

      {/* Create: pick client modal */}
      <Modal
        open={createPickerOpen && createClientId === null}
        title="הוסף מקדמה — בחר לקוח"
        className="min-h-[240px]"
        onClose={() => {
          setCreatePickerOpen(false)
          createPicker.resetClientPicker()
        }}
        footer={
          <Button
            variant="outline"
            onClick={() => {
              setCreatePickerOpen(false)
              createPicker.resetClientPicker()
            }}
          >
            ביטול
          </Button>
        }
      >
        <ClientPickerField
          selectedClient={createPicker.selectedClient}
          clientQuery={createPicker.clientQuery}
          onQueryChange={createPicker.handleClientQueryChange}
          onSelect={createPicker.handleSelectClient}
          onClear={createPicker.handleClearClient}
        />
      </Modal>

      {/* Create: form modal (after client picked) */}
      {createClientId !== null && (
        <CreateAdvancePaymentModal
          open={true}
          clientId={createClientId}
          year={year}
          isCreating={createMutation.isPending}
          onClose={() => {
            setCreateClientId(null)
            setCreatePickerOpen(false)
            createPicker.resetClientPicker()
          }}
          onCreate={(payload) => createMutation.mutateAsync(payload)}
        />
      )}

      {/* Generate schedule modal */}
      <Modal
        open={genPickerOpen}
        title="צור לוח מקדמות שנתי"
        onClose={() => {
          setGenPickerOpen(false)
          genPicker.resetClientPicker()
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setGenPickerOpen(false)
                genPicker.resetClientPicker()
              }}
            >
              ביטול
            </Button>
            <Button
              variant="primary"
              isLoading={generateMutation.isPending}
              disabled={
                genPicker.selectedClient === null ||
                isGenProfileLoading ||
                isGenProfileError ||
                generationFrequency == null ||
                generateMutation.isPending
              }
              onClick={handleGenerate}
            >
              צור לוח
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <ClientPickerField
            selectedClient={genPicker.selectedClient}
            clientQuery={genPicker.clientQuery}
            onQueryChange={genPicker.handleClientQueryChange}
            onSelect={genPicker.handleSelectClient}
            onClear={genPicker.handleClearClient}
          />
          {genPicker.selectedClient !== null && (
            <p className="text-sm text-gray-500">
              {isGenProfileLoading
                ? 'טוען פרופיל לקוח...'
                : isGenProfileError
                  ? 'שגיאה בטעינת פרופיל הלקוח'
                  : generationFrequency === 1
                    ? 'תדירות מקדמות: חודשי'
                    : generationFrequency === 2
                      ? 'תדירות מקדמות: דו-חודשי'
                      : 'תדירות מקדמות לא הוגדרה'}
            </p>
          )}
          <p className="text-sm text-gray-500">ייווצרו רק מקדמות שתאריך היעד שלהן מהיום והלאה</p>
        </div>
      </Modal>
    </div>
  )
}
