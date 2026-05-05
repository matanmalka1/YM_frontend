import { useState } from 'react'
import { getOperationalTaxYear } from '@/constants/periodOptions.constants'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AdvancePaymentRow, AdvancePaymentStatus, UpdateAdvancePaymentPayload } from '../types'
import { useAdvancePayments } from '../hooks/useAdvancePayments'
import { useAdvanceRateInsights } from '../hooks/useAdvanceRateInsights'
import { useRole } from '../../../hooks/useRole'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import { toast } from '../../../utils/toast'
import { getHttpStatus, showErrorToast } from '../../../utils/utils'
import { ClientAdvancePaymentsHeader } from './ClientAdvancePaymentsHeader'
import { ClientAdvancePaymentCards } from './ClientAdvancePaymentCards'
import { AdvancePaymentsKPICards } from './AdvancePaymentsKPICards'
import { AdvancePaymentDrawer } from './AdvancePaymentDrawer'
import { CreateAdvancePaymentModal } from './CreateAdvancePaymentModal'
import { PaginationCard } from '../../../components/ui/table/PaginationCard'
import { CLIENT_ADVANCE_PAYMENT_PAGE_SIZE } from './advancePaymentComponent.constants'
import { getTotalPages, toggleAdvancePaymentStatusFilter } from './advancePaymentComponent.utils'

interface ClientAdvancePaymentsTabProps {
  clientId: number
}

export const ClientAdvancePaymentsTab: React.FC<ClientAdvancePaymentsTabProps> = ({ clientId }) => {
  const [year, setYear] = useState(getOperationalTaxYear)
  const [statusFilter, setStatusFilter] = useState<AdvancePaymentStatus[]>([])
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerRow, setDrawerRow] = useState<AdvancePaymentRow | null>(null)
  const { isAdvisor } = useRole()

  const queryClient = useQueryClient()
  const { rows, isLoading, total, create, isCreating, deleteRow } = useAdvancePayments(
    clientId,
    year,
    statusFilter,
    page,
  )
  const { advancePaymentFrequency, advanceRate } = useAdvanceRateInsights(clientId)

  const generationFrequency: 1 | 2 | null =
    advancePaymentFrequency === 'bimonthly' ? 2 : advancePaymentFrequency === 'monthly' ? 1 : null

  const displayFrequency: 1 | 2 | null = rows.length > 0 ? rows[0].period_months_count : generationFrequency

  const generateMutation = useMutation({
    mutationFn: (periodMonthsCount: 1 | 2) => advancePaymentsApi.generateSchedule(clientId, year, periodMonthsCount),
    onSuccess: (data) => {
      const msg = data.created > 0 ? `נוצרו ${data.created} מקדמות` : 'הכול קיים'
      toast.success(msg)
      void queryClient.invalidateQueries({
        queryKey: advancedPaymentsQK.forClientYear(clientId, year),
      })
    },
    onError: (err) => showErrorToast(err, 'שגיאה ביצירת לוח מקדמות'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRow(id),
    onSuccess: () => {
      toast.success('מקדמה נמחקה בהצלחה')
      void queryClient.invalidateQueries({
        queryKey: advancedPaymentsQK.forClientYear(clientId, year),
      })
      setDrawerRow(null)
    },
    onError: (err) => showErrorToast(err, 'שגיאה במחיקת מקדמה'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAdvancePaymentPayload }) =>
      advancePaymentsApi.update(clientId, id, payload),
    onSuccess: () => {
      toast.success('מקדמה עודכנה בהצלחה')
      void queryClient.invalidateQueries({
        queryKey: advancedPaymentsQK.forClientYear(clientId, year),
      })
      setDrawerRow(null)
    },
    onError: (err) => showErrorToast(err, 'שגיאה בעדכון מקדמה'),
  })

  const totalPages = getTotalPages(total, CLIENT_ADVANCE_PAYMENT_PAGE_SIZE)

  const handleGenerateSchedule = () => {
    if (generationFrequency == null) {
      toast.error('לא ניתן ליצור לוח בלי תדירות מקדמות בפרופיל הלקוח')
      return
    }
    generateMutation.mutate(generationFrequency)
  }

  const handleStatusToggle = (status: AdvancePaymentStatus) => {
    setPage(1)
    setStatusFilter((prev) => toggleAdvancePaymentStatusFilter(prev, status))
  }

  const handleSave = async (id: number, payload: UpdateAdvancePaymentPayload) => {
    await updateMutation.mutateAsync({ id, payload })
  }

  const handleCreate = async (...args: Parameters<typeof create>) => {
    try {
      const result = await create(...args)
      toast.success('מקדמה נוצרה בהצלחה')
      return result
    } catch (err) {
      if (getHttpStatus(err) === 409) {
        toast.error('מקדמה לחודש זה כבר קיימת')
      } else {
        showErrorToast(err, 'שגיאה ביצירת מקדמה')
      }
      throw err
    }
  }

  return (
    <div className="space-y-6">
      <ClientAdvancePaymentsHeader
        isAdvisor={isAdvisor}
        statusFilter={statusFilter}
        onToggleStatus={handleStatusToggle}
        year={year}
        onYearChange={(nextYear) => {
          setPage(1)
          setYear(nextYear)
        }}
        onOpenCreate={() => setModalOpen(true)}
        onGenerateSchedule={handleGenerateSchedule}
        displayFrequency={displayFrequency}
        generationFrequency={generationFrequency}
        isGenerating={generateMutation.isPending}
        advanceRate={advanceRate}
      />

      <AdvancePaymentsKPICards clientId={clientId} year={year} />

      <ClientAdvancePaymentCards rows={rows} isLoading={isLoading} onRowClick={(row) => setDrawerRow(row)} />

      {totalPages > 1 && (
        <PaginationCard page={page} totalPages={totalPages} total={total} label="מקדמות" onPageChange={setPage} />
      )}

      <AdvancePaymentDrawer
        row={drawerRow}
        open={drawerRow !== null}
        isUpdating={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
        canEdit={isAdvisor}
        onClose={() => setDrawerRow(null)}
        onSave={handleSave}
        onDelete={isAdvisor ? (id) => deleteMutation.mutateAsync(id) : undefined}
      />

      {isAdvisor && (
        <CreateAdvancePaymentModal
          open={modalOpen}
          clientId={clientId}
          year={year}
          defaultPeriodMonthsCount={generationFrequency ?? displayFrequency ?? 1}
          isCreating={isCreating}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}
