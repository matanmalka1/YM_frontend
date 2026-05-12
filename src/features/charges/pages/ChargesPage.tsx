import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import {
  ChargeBulkToolbar,
  buildChargeColumns,
  ChargesCreateModal,
  ChargeDetailDrawer,
  ChargesFiltersCard,
  ChargesSummaryBar,
  useChargesPage,
} from '@/features/charges'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { getChargeRowClassName, getChargesEmptyState } from '../helpers'

export const Charges: React.FC = () => {
  const { searchParams, setSearchParams } = useSearchParamFilters()
  const [selectedChargeId, setSelectedChargeId] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
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

      {!isAdvisor && <Alert variant="info" message="צפייה בלבד. יצירה ושינוי חיובים זמינים ליועץ בלבד." />}

      <ChargesFiltersCard
        filters={filters}
        onFilterChange={setFilter}
        onClear={() => setSearchParams(new URLSearchParams())}
      />

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
        page={filters.page}
        pageSize={filters.page_size}
        total={total}
        label="חיובים"
        onPageChange={setPage}
        onPageSizeChange={(pageSize) => setFilter('page_size', String(pageSize))}
        rowClassName={(charge) => getChargeRowClassName(charge.status)}
        emptyMessage="אין חיובים להצגה"
        emptyState={getChargesEmptyState(isAdvisor, () => setShowCreateModal(true))}
      />

      <ChargeDetailDrawer chargeId={selectedChargeId} onClose={closeChargeDetail} />
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
