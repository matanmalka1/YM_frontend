import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Clock, FileText, Hourglass, CheckCircle2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  buildVatWorkItemColumns,
  useVatWorkItemsPage,
  useVatWorkItemGroups,
  VatWorkItemsCreateModal,
  VatWorkItemsFiltersCard,
  VatWorkItemsGroupedCards,
} from '@/features/vatReports'
import { buildVatEmptyStateTitle, toOptionalVatPeriodTypeFilter } from '@/features/vatReports/filterUtils'
import type { VatWorkItemResponse } from '@/features/vatReports'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { StatsCard } from '@/components/ui/layout/StatsCard'

export const VatWorkItems: React.FC = () => {
  const [urlParams] = useSearchParams()

  const {
    actionLoadingId,
    createError,
    createLoading,
    filters,
    isAdvisor,
    loading: statsLoading,
    runAction,
    setFilter,
    setFilters,
    setSearchParams,
    statsFiled,
    statsPending,
    statsReview,
    statsTyping,
    submitCreate,
  } = useVatWorkItemsPage()

  const {
    groups,
    isLoading: groupsLoading,
    error: groupsError,
  } = useVatWorkItemGroups({
    period_type: toOptionalVatPeriodTypeFilter(filters.period_type),
    status: filters.status || undefined,
    client_name: filters.clientSearchName || undefined,
    year: filters.year ? Number(filters.year) : undefined,
  })

  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const createClientId = urlParams.get('client_id')
  const createPeriod = urlParams.get('period')

  useEffect(() => {
    if (urlParams.get('create') !== '1') return
    setShowCreateModal(true)
    const nextParams = new URLSearchParams(urlParams)
    nextParams.delete('create')
    navigate({ search: nextParams.toString() }, { replace: true, preventScrollReset: true })
  }, [urlParams, navigate])

  const closeCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleClearFilters = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams])

  const handleRowClick = useCallback((item: VatWorkItemResponse) => navigate(`/tax/vat/${item.id}`), [navigate])

  const columns = useMemo(
    () =>
      buildVatWorkItemColumns({
        isLoading: false,
        isDisabled: actionLoadingId !== null,
        runAction,
      }),
    [actionLoadingId, runAction],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title='דוחות מע"מ (לקוח)'
        description='ניהול תיקי מע"מ חודשיים ברמת לקוח — הקלדה, בדיקה והגשה'
        actions={
          isAdvisor ? (
            <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(true)}>
              דוח מע״מ חדש
              <Plus className="h-4 w-4" />
            </Button>
          ) : undefined
        }
      />

      {!isAdvisor && (
        <Alert variant="info" message='צפייה בלבד. פתיחת תיקי מע"מ זמינה ליועץ. ניתן לבצע הקלדת נתונים בתוך כל תיק.' />
      )}

      {!statsLoading && groups.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatsCard title="ממתין לחומרים" value={statsPending ?? 0} icon={Hourglass} variant="orange" />
          <StatsCard title="בהקלדה" value={statsTyping ?? 0} icon={Clock} variant="blue" />
          <StatsCard title="ממתין לבדיקה" value={statsReview ?? 0} icon={FileText} variant="orange" />
          <StatsCard title="הוגש" value={statsFiled ?? 0} icon={CheckCircle2} variant="green" />
        </div>
      )}

      <VatWorkItemsFiltersCard
        filters={filters}
        onFilterChange={setFilter}
        onMultiFilterChange={setFilters}
        onClear={handleClearFilters}
      />

      <VatWorkItemsGroupedCards
        groups={groups}
        columns={columns}
        isLoading={groupsLoading}
        error={groupsError}
        onRowClick={handleRowClick}
        filters={{ status: filters.status || undefined, client_name: filters.clientSearchName || undefined }}
        emptyState={{
          title: buildVatEmptyStateTitle(filters),
          message: isAdvisor ? 'נסה לשנות את הסינון או לפתוח תיק חדש' : 'נסה לשנות את הסינון',
          action: isAdvisor ? { label: 'תיק חדש', onClick: () => setShowCreateModal(true) } : undefined,
        }}
      />

      <VatWorkItemsCreateModal
        open={showCreateModal}
        createError={createError}
        createLoading={createLoading}
        onClose={closeCreateModal}
        onSubmit={submitCreate}
        initialClientId={createClientId ? Number(createClientId) : undefined}
        initialPeriod={createPeriod ?? undefined}
      />
    </div>
  )
}
