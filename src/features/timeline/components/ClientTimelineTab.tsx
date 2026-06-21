import { useMemo, useRef, useState } from 'react'
import { useClientTimelinePage } from '../hooks/useClientTimelinePage'
import { TimelineCommandBar } from './TimelineCommandBar'
import { TimelineCard } from './TimelineCard'
import { groupTimelineEventsByDate, getDefaultOpenTimelineGroups } from '../lib/timelineGroups'
import { PaginationCard } from '../../../components/ui/table/PaginationCard'
import { getTotalPages } from '../../../utils/paginationUtils'
import { PageLoading } from '../../../components/ui/layout/PageLoading'
import { Alert } from '../../../components/ui/overlays/Alert'

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
    summary: { lastEventTimestamp },
  } = useClientTimelinePage(clientId)

  const timelineGroups = useMemo(() => groupTimelineEventsByDate(filteredEvents), [filteredEvents])

  // Default expansion derived from the current filters/groups (no effect).
  const defaultExpandedKeys = useMemo(
    () =>
      filters.hasActiveFilters
        ? new Set(timelineGroups.map((g) => g.date))
        : getDefaultOpenTimelineGroups(timelineGroups),
    [timelineGroups, filters.hasActiveFilters],
  )

  // User toggles override the default; the override resets whenever the default
  // changes (filters/groups/page) — render-time reset, the sanctioned alternative
  // to a prop-sync effect. https://react.dev/learn/you-might-not-need-an-effect
  const [overrideKeys, setOverrideKeys] = useState<Set<string> | null>(null)
  const seenDefaultRef = useRef(defaultExpandedKeys)
  if (seenDefaultRef.current !== defaultExpandedKeys) {
    seenDefaultRef.current = defaultExpandedKeys
    setOverrideKeys(null)
  }
  const expandedDateKeys = overrideKeys ?? defaultExpandedKeys

  if (loading) return <PageLoading message="טוען ציר זמן..." />
  if (error) return <Alert variant="error" message={error} />

  const totalPages = getTotalPages(total, pageSize)

  const toggleDate = (date: string) =>
    setOverrideKeys((current) => {
      const next = new Set(current ?? defaultExpandedKeys)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })

  const expandAll = () => setOverrideKeys(new Set(timelineGroups.map((g) => g.date)))
  const collapseAll = () => setOverrideKeys(new Set())

  return (
    <div className="space-y-4">
      <TimelineCommandBar
        total={total}
        hasActiveFilters={filters.hasActiveFilters}
        lastEventTimestamp={lastEventTimestamp}
        refreshing={refreshing}
        onRefresh={refresh}
        searchTerm={filters.searchTerm}
        onSearchChange={filters.setSearchTerm}
        typeFilters={filters.typeFilters}
        onToggleTypeFilter={filters.toggleTypeFilter}
        importantOnly={filters.importantOnly}
        onImportantOnlyChange={filters.setImportantOnly}
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
      />

      {totalPages > 1 && (
        <PaginationCard page={page} totalPages={totalPages} total={total} label="אירועים" onPageChange={setPage} />
      )}
    </div>
  )
}

ClientTimelineTab.displayName = 'ClientTimelineTab'
