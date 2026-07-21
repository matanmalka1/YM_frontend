import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Plus } from 'lucide-react'
import { InlineState } from '@/components/ui/feedback'
import { Spinner } from '@/components/ui/primitives/Spinner'
import { Button } from '@/components/ui/primitives/Button'
import { Select } from '@/components/ui/inputs/Select'
import { DetailTabPanel } from '@/components/ui/layout'
import { VatWorkItemsCreateModal } from '../form/VatWorkItemsCreateModal'
import { VatExportButtons } from '../shared/VatExportButtons'
import { VatPeriodCard } from './VatPeriodCard'
import type { CreateVatWorkItemPayload, VatPeriodRow } from '../../api'
import { showErrorToast } from '@/utils/utils'
import { useRole } from '@/hooks/useRole'
import { useVatClientSummary } from '../../hooks/useVatClientSummary'
import type { VatClientSummaryPanelProps } from '../../types'
import { canOpenVatPeriodRow, getClientSummaryRowsForYear } from '../../utils/viewHelpers'
import { VatClientSummaryStatsSection } from './VatClientSummaryStatsSection'
import { VAT_MESSAGES } from '../../messages'
import { VAT_ERROR_MESSAGES } from '../../errorMessages'

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
      setCreateError(showErrorToast(err, VAT_ERROR_MESSAGES.detail.createWorkItemError))
      return false
    }
  }

  const handleRowClick = (row: VatPeriodRow) => {
    if (!canOpenVatPeriodRow(row)) return
    navigate(`/clients/${clientId}/vat/${row.work_item_id}`)
  }

  return (
    <DetailTabPanel
      title={VAT_MESSAGES.clientSummary.yearTitle(selectedAnnual?.year ?? selectedYear)}
      subtitle={VAT_MESSAGES.clientSummary.yearSubtitle}
      actions={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {isAdvisor && <VatExportButtons clientId={clientId} year={selectedAnnual?.year ?? selectedYear} />}
          <Select
            value={String(selectedYear)}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            options={yearOptions}
            size="sm"
            fieldClassName="w-28 shrink-0"
          />
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setCreateOpen(true)}
            className="whitespace-nowrap"
          >
            {VAT_MESSAGES.actions.openNewVatReport}
          </Button>
        </div>
      }
      summary={!error && selectedAnnual ? <VatClientSummaryStatsSection annual={selectedAnnual} /> : undefined}
    >
      {error ? (
        <InlineState variant="error" icon={AlertTriangle} title={VAT_ERROR_MESSAGES.detail.loadClientVatError} />
      ) : isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label={VAT_MESSAGES.detail.loadingClientVat} />
        </div>
      ) : !selectedAnnual || rows.length === 0 ? (
        <InlineState title={VAT_MESSAGES.detail.noClientPeriods} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <VatPeriodCard key={row.period} row={row} onOpen={() => handleRowClick(row)} disabled={!canOpenVatPeriodRow(row)} />
          ))}
        </div>
      )}

      <VatWorkItemsCreateModal
        open={createOpen}
        createError={createError}
        createLoading={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        initialClientId={clientId}
      />
    </DetailTabPanel>
  )
}

VatClientSummaryPanel.displayName = 'VatClientSummaryPanel'
