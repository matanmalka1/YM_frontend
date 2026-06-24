import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { InlineState } from '@/components/ui/feedback'
import { Spinner } from '@/components/ui/primitives/Spinner'
import { VatWorkItemsCreateModal } from '../form/VatWorkItemsCreateModal'
import { VatClientActionBar } from './VatClientActionBar'
import { VatPeriodCard } from './VatPeriodCard'
import type { CreateVatWorkItemPayload, VatAnnualSummary, VatPeriodRow } from '../../api'
import { showErrorToast } from '@/utils/utils'
import { useRole } from '@/hooks/useRole'
import { useVatClientSummary } from '../../hooks/useVatClientSummary'
import type { VatClientSummaryPanelProps } from '../../types'
import { canOpenVatPeriodRow, getClientSummaryRowsForYear } from '../../utils/viewHelpers'
import { VatClientSummaryStatsSection } from './VatClientSummaryStatsSection'
import { VAT_MESSAGES } from '../../messages'

const YearSummary = ({ annual }: { annual: VatAnnualSummary }) => {
  return (
    <section className="space-y-3">
      <div className="mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{VAT_MESSAGES.clientSummary.yearTitle(annual.year)}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{VAT_MESSAGES.clientSummary.yearSubtitle}</p>
        </div>
      </div>
      <VatClientSummaryStatsSection annual={annual} />
    </section>
  )
}

export const VatClientSummaryPanel = ({ clientId }: VatClientSummaryPanelProps) => {
  const { isAdvisor } = useRole()
  const navigate = useNavigate()

  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const { data, isLoading, error, createMutation } = useVatClientSummary(clientId)

  const yearOptions = useMemo(() => {
    const years = data?.annual.map((a) => a.year) ?? [selectedYear]
    return years.map((year) => ({ value: String(year), label: String(year) }))
  }, [data, selectedYear])

  const selectedAnnual = useMemo(() => {
    const annual = data?.annual ?? []
    return annual.find((a) => a.year === selectedYear) ?? annual[0] ?? null
  }, [data, selectedYear])

  const rows = useMemo(() => {
    return getClientSummaryRowsForYear(data?.periods, selectedAnnual?.year)
  }, [data, selectedAnnual])

  const handleCreate = async (payload: CreateVatWorkItemPayload) => {
    setCreateError(null)
    try {
      await createMutation.mutateAsync(payload)
      setCreateOpen(false)
      return true
    } catch (err) {
      setCreateError(showErrorToast(err, VAT_MESSAGES.detail.createWorkItemError))
      return false
    }
  }

  const handleRowClick = (row: VatPeriodRow) => {
    if (!canOpenVatPeriodRow(row)) return
    navigate(`/tax/vat/${row.work_item_id}`)
  }

  return (
    <div className="space-y-4">
      <VatClientActionBar
        clientId={clientId}
        isAdvisor={isAdvisor}
        selectedYear={selectedAnnual?.year ?? selectedYear}
        yearOptions={yearOptions}
        onCreateClick={() => setCreateOpen(true)}
        onYearChange={setSelectedYear}
      />

      {error && <InlineState variant="error" icon={AlertTriangle} title={VAT_MESSAGES.detail.loadClientVatError} />}

      {!error && selectedAnnual && <YearSummary annual={selectedAnnual} />}

      {/* Cards */}
      {!error && (
        <>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner label={VAT_MESSAGES.detail.loadingClientVat} />
            </div>
          ) : !selectedAnnual || rows.length === 0 ? (
            <InlineState title={VAT_MESSAGES.detail.noClientPeriods} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((row) => (
                <VatPeriodCard
                  key={row.period}
                  row={row}
                  onOpen={() => handleRowClick(row)}
                  disabled={!canOpenVatPeriodRow(row)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <VatWorkItemsCreateModal
        open={createOpen}
        createError={createError}
        createLoading={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        initialClientId={clientId}
      />
    </div>
  )
}

VatClientSummaryPanel.displayName = 'VatClientSummaryPanel'
