import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { Select } from '@/components/ui/inputs'
import { useClientCharges } from '../hooks/useClientCharges'
import { buildChargeColumns } from './ChargeColumns'
import { ChargeDetailDrawer } from './ChargeDetailDrawer'
import { ChargesCreateModal } from './ChargesCreateModal'
import { ChargesSummaryBar } from './ChargesSummaryBar'
import { ChargesTableBlock } from './ChargesTableBlock'

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

      <ChargesTableBlock
        charges={charges}
        columns={columns}
        error={error}
        isAdvisor={isAdvisor}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        selectedCount={selectedIds.size}
        bulkLoading={bulkLoading}
        onBulkAction={runBulkAction}
        onClearSelection={clearSelection}
        onCreateCharge={() => setShowCreateModal(true)}
        onOpenCharge={setSelectedChargeId}
        onPageChange={setPage}
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
