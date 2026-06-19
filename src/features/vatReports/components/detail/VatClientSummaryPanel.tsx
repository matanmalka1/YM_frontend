import { useState, useMemo } from 'react'
import { Activity, CheckCircle2, MinusCircle, ReceiptText, WalletCards } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { VatWorkItemsCreateModal } from '../form/VatWorkItemsCreateModal'
import { VatClientActionBar } from './VatClientActionBar'
import { VatPeriodCard } from './VatPeriodCard'
import type { CreateVatWorkItemPayload, VatAnnualSummary, VatPeriodRow } from '../../api'
import { showErrorToast } from '@/utils/utils'
import { useRole } from '@/hooks/useRole'
import { formatVatAmount } from '../../utils/vatHelpers'
import { useVatClientSummary } from '../../hooks/useVatClientSummary'
import type { VatClientSummaryPanelProps } from '../../types'
import { canOpenVatPeriodRow, getClientSummaryRowsForYear } from '../../utils/viewHelpers'

const fmt = formatVatAmount

const YearSummary = ({ annual }: { annual: VatAnnualSummary }) => {
  const avgNetVat = annual.periods_count > 0 ? (Number(annual.net_vat) / annual.periods_count).toFixed(2) : null

  return (
    <section className="space-y-3">
      <div className="mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">סיכום מע״מ לשנת {annual.year}</h3>
          <p className="mt-0.5 text-xs text-gray-500">נתוני התקופות שהוקלדו והוגשו עבור הלקוח</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard
          title="תקופות שהוגשו"
          value={`${annual.filed_count} מתוך ${annual.periods_count}`}
          icon={CheckCircle2}
          variant="green"
        />
        <StatsCard title="מע״מ עסקאות" value={fmt(annual.total_output_vat)} icon={ReceiptText} variant="neutral" />
        <StatsCard title="מע״מ תשומות" value={fmt(annual.total_input_vat)} icon={MinusCircle} variant="neutral" />
        <StatsCard
          title="מע״מ נטו לתשלום"
          value={fmt(annual.net_vat)}
          icon={WalletCards}
          variant={Number(annual.net_vat) >= 0 ? 'red' : 'green'}
        />
        <StatsCard
          title="מע״מ ממוצע לתקופה"
          value={avgNetVat !== null ? fmt(avgNetVat) : '—'}
          icon={Activity}
          variant="neutral"
        />
      </div>
    </section>
  )
}

export const VatClientSummaryPanel = ({ clientId }: VatClientSummaryPanelProps) => {
  const { isAdvisor } = useRole()
  const navigate = useNavigate()

  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
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
      setCreateError(showErrorToast(err, 'שגיאה ביצירת תיק המע״מ'))
      return false
    }
  }

  const handleRowClick = (row: VatPeriodRow) => {
    if (!canOpenVatPeriodRow(row)) return
    navigate(`/tax/vat/${row.work_item_id}`)
  }

  return (
    <div className="space-y-4" dir="rtl">
      <VatClientActionBar
        clientId={clientId}
        isAdvisor={isAdvisor}
        selectedYear={selectedAnnual?.year ?? selectedYear}
        yearOptions={yearOptions}
        onCreateClick={() => setCreateOpen(true)}
        onYearChange={setSelectedYear}
      />

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-negative-200 bg-negative-50 px-4 py-3 text-sm text-negative-700">
          שגיאה בטעינת נתוני מע״מ. אנא נסה שוב מאוחר יותר.
        </div>
      )}

      {!error && selectedAnnual && <YearSummary annual={selectedAnnual} />}

      {/* Cards */}
      {!error && (
        <>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-gray-400">טוען...</div>
          ) : !selectedAnnual || rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">אין תקופות מע״מ ללקוח זה</div>
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
