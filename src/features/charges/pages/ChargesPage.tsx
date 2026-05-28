import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/primitives/Button'
import {
  buildChargeColumns,
  ChargesCreateModal,
  ChargeDetailDrawer,
  ChargesFiltersCard,
  ChargesSummaryBar,
  ChargesTableBlock,
  useChargesPage,
} from '@/features/charges'
import { SendNotificationModal, type NotificationTrigger } from '@/features/notifications'
import type { ChargeResponse } from '@/features/charges'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'

export const Charges: React.FC = () => {
  const { searchParams, setSearchParams } = useSearchParamFilters()
  const [selectedChargeId, setSelectedChargeId] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [notificationContext, setNotificationContext] = useState<{
    charge: ChargeResponse
    trigger: NotificationTrigger
  } | null>(null)
  const {
    actionLoadingId,
    bulkLoading,
    charges,
    createError,
    createLoading,
    error,
    filters,
    isAdvisor,
    loading,
    runAction,
    runBulkAction,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    setFilter,
    setPage,
    stats,
    submitCreate,
    total,
  } = useChargesPage()
  const allIds = useMemo(() => charges.map((c) => c.id), [charges])
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
        onSendNotification: (charge, trigger) => setNotificationContext({ charge, trigger }),
      }),
    [isAdvisor, actionLoadingId, runAction, selectedIds, toggleSelect, toggleSelectAll, allIds],
  )
  const chargeIdParam = searchParams.get('charge_id')

  useEffect(() => {
    const chargeId = Number(chargeIdParam)
    if (Number.isInteger(chargeId) && chargeId > 0) {
      setSelectedChargeId(chargeId)
    }
  }, [chargeIdParam])

  useEffect(() => {
    if (searchParams.get('create') !== '1' || !isAdvisor) return
    setShowCreateModal(true)
    const next = new URLSearchParams(searchParams)
    next.delete('create')
    setSearchParams(next, { replace: true })
  }, [isAdvisor, searchParams, setSearchParams])

  const closeChargeDetail = () => {
    setSelectedChargeId(null)
    const next = new URLSearchParams(searchParams)
    next.delete('charge_id')
    setSearchParams(next)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="חיובים"
        description="רשימת חיובים ופעולות חיוב נתמכות"
        actions={
          <div className="flex items-center gap-2">
            {isAdvisor && (
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(true)}>
                חיוב חדש
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        }
      />

      <ChargesSummaryBar
        stats={stats}
        isAdvisor={isAdvisor}
        currentStatus={filters.status}
        onStatusClick={(status) => setFilter('status', status)}
      />

      <ChargesFiltersCard
        filters={filters}
        onFilterChange={setFilter}
        onClear={() => setSearchParams(new URLSearchParams())}
      />

      <ChargesTableBlock
        charges={charges}
        columns={columns}
        error={error}
        isAdvisor={isAdvisor}
        loading={loading}
        page={filters.page}
        pageSize={filters.page_size}
        total={total}
        selectedCount={selectedIds.size}
        bulkLoading={bulkLoading}
        onBulkAction={runBulkAction}
        onClearSelection={clearSelection}
        onCreateCharge={() => setShowCreateModal(true)}
        onOpenCharge={setSelectedChargeId}
        onPageChange={setPage}
        onPageSizeChange={(pageSize) => setFilter('page_size', String(pageSize))}
      />

      <ChargeDetailDrawer chargeId={selectedChargeId} onClose={closeChargeDetail} />
      {notificationContext && (
        <SendNotificationModal
          open={notificationContext !== null}
          onClose={() => setNotificationContext(null)}
          clientRecordId={notificationContext.charge.client_record_id}
          initialTrigger={notificationContext.trigger}
          entityId={notificationContext.charge.id}
          disableTriggerChange
        />
      )}
      <ChargesCreateModal
        open={showCreateModal}
        createError={createError}
        createLoading={createLoading}
        onClose={() => setShowCreateModal(false)}
        onSubmit={submitCreate}
      />
    </div>
  )
}
