import { useEffect, useMemo, useState } from 'react'
import { useClientTimelinePage } from '../hooks/useClientTimelinePage'
import { TimelineCommandBar } from './TimelineCommandBar'
import { TimelineCard } from './TimelineCard'
import { groupTimelineEventsByDate, getDefaultOpenTimelineGroups } from '../lib/timelineGroups'
import { PaginationCard } from '../../../components/ui/table/PaginationCard'
import { PageLoading } from '../../../components/ui/layout/PageLoading'
import { Alert } from '../../../components/ui/overlays/Alert'
import { ConfirmDialog } from '../../../components/ui/overlays/ConfirmDialog'

interface ClientTimelineTabProps {
  clientId: string | undefined
}

export const ClientTimelineTab: React.FC<ClientTimelineTabProps> = ({ clientId }) => {
  const {
    error,
    filteredEvents,
    loading,
    refreshing,
    page,
    pageSize,
    setPage,
    setPageSize,
    total,
    refresh,
    filters,
    eventTypeStats,
    summary,
    activeActionKey,
    handleAction,
    pendingAction,
    confirmPendingAction,
    cancelPendingAction,
  } = useClientTimelinePage(clientId)

  const timelineGroups = useMemo(() => groupTimelineEventsByDate(filteredEvents), [filteredEvents])
  const [expandedDateKeys, setExpandedDateKeys] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (filters.hasActiveFilters) {
      setExpandedDateKeys(new Set(timelineGroups.map((g) => g.date)))
    } else {
      setExpandedDateKeys(getDefaultOpenTimelineGroups(timelineGroups))
    }
  }, [timelineGroups, filters.hasActiveFilters])

  if (loading) return <PageLoading message="טוען ציר זמן..." />
  if (error) return <Alert variant="error" message={error} />

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const toggleDate = (date: string) =>
    setExpandedDateKeys((current) => {
      const next = new Set(current)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })

  const expandAll = () => setExpandedDateKeys(new Set(timelineGroups.map((g) => g.date)))
  const collapseAll = () => setExpandedDateKeys(new Set())

  return (
    <div className="space-y-4">
      <TimelineCommandBar
        total={summary.totalOnPage}
        hasActiveFilters={filters.hasActiveFilters}
        lastEventTimestamp={summary.lastEventTimestamp}
        refreshing={refreshing}
        onRefresh={refresh}
        searchTerm={filters.searchTerm}
        onSearchChange={filters.setSearchTerm}
        typeFilters={filters.typeFilters}
        onToggleTypeFilter={filters.toggleTypeFilter}
        onClearFilters={filters.clearFilters}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        eventTypeStats={eventTypeStats}
      />

      <TimelineCard
        events={filteredEvents}
        expandedDateKeys={expandedDateKeys}
        onToggleDate={toggleDate}
        hasActiveFilters={filters.hasActiveFilters}
        onClearFilters={filters.clearFilters}
        onAction={handleAction}
        activeActionKey={activeActionKey}
      />

      {totalPages > 1 && (
        <PaginationCard page={page} totalPages={totalPages} total={total} label="אירועים" onPageChange={setPage} />
      )}

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.confirm?.title || 'אישור פעולה'}
        message={pendingAction?.confirm?.message || 'האם להמשיך בביצוע הפעולה?'}
        confirmLabel={pendingAction?.confirm?.confirmLabel || 'אישור'}
        cancelLabel={pendingAction?.confirm?.cancelLabel || 'ביטול'}
        isLoading={activeActionKey === pendingAction?.uiKey}
        onConfirm={confirmPendingAction}
        onCancel={cancelPendingAction}
      />
    </div>
  )
}

ClientTimelineTab.displayName = 'ClientTimelineTab'
