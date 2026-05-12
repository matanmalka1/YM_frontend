import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { Select } from '@/components/ui/inputs'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import { getChargeRowClassName, getChargesEmptyState } from '../helpers'
import { useClientCharges } from '../hooks/useClientCharges'
import { ChargeBulkToolbar } from './ChargeBulkToolbar'
import { buildChargeColumns } from './ChargeColumns'
import { ChargeDetailDrawer } from './ChargeDetailDrawer'
import { ChargesCreateModal } from './ChargesCreateModal'
import { ChargesSummaryBar } from './ChargesSummaryBar'

interface ClientChargesTabProps {
  clientId: number
  clientName: string
}

export const ClientChargesTab: React.FC<ClientChargesTabProps> = ({ clientId, clientName }) => {
  const [selectedChargeId, setSelectedChargeId] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const {
    charges,
    total,
    stats,
    error,
    loading,
    page,
    pageSize,
    allIds,
    isAdvisor,
    businesses,
    businessesLoading,
    selectedBusinessId,
    setSelectedBusinessId,
    selectedIds,
    actionLoadingId,
    bulkLoading,
    createError,
    createLoading,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    runAction,
    runBulkAction,
    submitCreate,
    handleStatusChange,
    setPage,
    currentStatus,
  } = useClientCharges(clientId)

  const columns = useMemo(
    () =>
      buildChargeColumns({
        isAdvisor,
        actionLoadingId,
        runAction,
        onOpenDetail: setSelectedChargeId,
        selectedIds,
        onToggleSelect: toggleSelect,
        onToggleAll: toggleSelectAll,
        allIds,
      }),
    [actionLoadingId, allIds, isAdvisor, runAction, selectedIds, toggleSelect, toggleSelectAll],
  )

  const businessOptions = useMemo(
    () => [
      { value: '', label: 'כל העסקים' },
      ...businesses.map((b) => ({ value: String(b.id), label: b.business_name ?? `עסק #${b.id}` })),
    ],
    [businesses],
  )

  const selectedBusiness =
    selectedBusinessId != null ? (businesses.find((b) => b.id === selectedBusinessId) ?? null) : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">חיובים</h2>
          <p className="text-sm text-gray-500">חיובים המקושרים ללקוח זה</p>
        </div>
        <div className="flex items-center gap-2">
          {businesses.length > 1 && (
            <Select
              value={selectedBusinessId != null ? String(selectedBusinessId) : ''}
              onChange={(e) => setSelectedBusinessId(e.target.value ? Number(e.target.value) : null)}
              options={businessOptions}
              disabled={businessesLoading}
            />
          )}
          {isAdvisor && (
            <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(true)} className="whitespace-nowrap">
              חיוב חדש
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <ChargesSummaryBar
        stats={stats}
        isAdvisor={isAdvisor}
        currentStatus={currentStatus}
        onStatusClick={handleStatusChange}
      />

      {!isAdvisor && <Alert variant="info" message="צפייה בלבד. יצירה ושינוי חיובים זמינים ליועץ בלבד." />}

      {isAdvisor && selectedIds.size > 0 && (
        <ChargeBulkToolbar
          selectedCount={selectedIds.size}
          loading={bulkLoading}
          onAction={runBulkAction}
          onClear={clearSelection}
        />
      )}

      <PaginatedDataTable
        data={charges}
        columns={columns}
        getRowKey={(charge) => charge.id}
        onRowClick={(charge) => setSelectedChargeId(charge.id)}
        isLoading={loading}
        error={error}
        page={page}
        pageSize={pageSize}
        total={total}
        label="חיובים"
        onPageChange={setPage}
        rowClassName={(charge) => getChargeRowClassName(charge.status)}
        emptyMessage="אין חיובים להצגה"
        emptyState={getChargesEmptyState(isAdvisor, () => setShowCreateModal(true))}
      />

      <ChargeDetailDrawer chargeId={selectedChargeId} onClose={() => setSelectedChargeId(null)} />
      <ChargesCreateModal
        open={showCreateModal}
        createError={createError}
        createLoading={createLoading}
        onClose={() => setShowCreateModal(false)}
        onSubmit={submitCreate}
        initialClient={{ id: clientId, name: clientName }}
        initialBusiness={
          selectedBusiness
            ? { id: selectedBusiness.id, name: selectedBusiness.business_name ?? `עסק #${selectedBusiness.id}` }
            : null
        }
        businesses={businesses}
      />
    </div>
  )
}
