import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { DetailTabPanel } from '@/components/ui/layout'
import { Select } from '@/components/ui/inputs'
import { useClientCharges } from '../../hooks/useClientCharges'
import { buildChargeColumns } from '../list/ChargeColumns'
import { ChargesCreateModal } from '../form/ChargesCreateModal'
import { ChargesStatsSection } from '../list/ChargesStatsSection'
import { ChargesTableBlock } from '../list/ChargesTableBlock'
import { getChargeBusinessLabel } from '../../utils/chargeUtils'
import { CHARGES_MESSAGES } from '../../messages'
import { CHARGE_ROUTES } from '../../api/endpoints'

interface ClientChargesTabProps {
  clientId: number
  clientName: string
}

export const ClientChargesTab: React.FC<ClientChargesTabProps> = ({ clientId, clientName }) => {
  const navigate = useNavigate()
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
    setPage,
  } = useClientCharges(clientId)

  const columns = useMemo(
    () =>
      buildChargeColumns({
        isAdvisor,
        actionLoadingId,
        runAction,
        onOpenDetail: (chargeId) => navigate(CHARGE_ROUTES.clientDetail(clientId, chargeId)),
        selectedIds,
        onToggleSelect: toggleSelect,
        onToggleAll: toggleSelectAll,
        allIds,
      }),
    [actionLoadingId, allIds, clientId, isAdvisor, navigate, runAction, selectedIds, toggleSelect, toggleSelectAll],
  )

  const businessOptions = useMemo(
    () => [
      { value: '', label: CHARGES_MESSAGES.list.allBusinesses },
      ...businesses.map((b) => ({ value: String(b.id), label: getChargeBusinessLabel(b) })),
    ],
    [businesses],
  )

  const selectedBusiness = selectedBusinessId != null ? (businesses.find((b) => b.id === selectedBusinessId) ?? null) : null

  return (
    <DetailTabPanel
      title={CHARGES_MESSAGES.list.title}
      subtitle={CHARGES_MESSAGES.list.clientTabSubtitle}
      actions={
        <div className="flex items-center gap-2">
          {businesses.length > 0 && (
            <Select
              value={selectedBusinessId != null ? String(selectedBusinessId) : ''}
              onChange={(e) => setSelectedBusinessId(e.target.value ? Number(e.target.value) : null)}
              options={businessOptions}
              disabled={businessesLoading}
              fieldClassName="w-48 max-w-[60vw]"
              menuWidth="content"
            />
          )}
          {isAdvisor && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setShowCreateModal(true)}
              className="whitespace-nowrap"
            >
              {CHARGES_MESSAGES.list.newCharge}
            </Button>
          )}
        </div>
      }
      summary={<ChargesStatsSection stats={stats} isAdvisor={isAdvisor} />}
    >
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
        onOpenCharge={(chargeId) => navigate(CHARGE_ROUTES.clientDetail(clientId, chargeId))}
        onPageChange={setPage}
      />

      <ChargesCreateModal
        open={showCreateModal}
        createError={createError}
        createLoading={createLoading}
        onClose={() => setShowCreateModal(false)}
        onSubmit={submitCreate}
        initialClient={{ id: clientId, name: clientName }}
        initialBusiness={selectedBusiness ? { id: selectedBusiness.id, name: getChargeBusinessLabel(selectedBusiness) } : null}
        businesses={businesses}
      />
    </DetailTabPanel>
  )
}
