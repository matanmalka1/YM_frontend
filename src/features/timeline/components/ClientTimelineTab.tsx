import { useMemo, useRef, useState } from 'react'
import { useClientTimelinePage } from '../hooks/useClientTimelinePage'
import { TimelineFilterPanel } from './TimelineFilterPanel'
import { TimelineCard } from './TimelineCard'
import { groupTimelineEventsByDate, getDefaultOpenTimelineGroups } from '../lib/timelineGroups'
import { PaginationCard } from '@/components/ui/table'
import { getTotalPages } from '../../../utils/paginationUtils'
import { PageLoading } from '../../../components/ui/layout/PageLoading'
import { Alert } from '../../../components/ui/overlays/Alert'
import { TIMELINE_MESSAGES } from '../messages'

interface ClientTimelineTabProps {
  clientId: string | undefined
}

export const ClientTimelineTab: React.FC<ClientTimelineTabProps> = ({ clientId }) => {
  const {
    error,
    filteredEvents,
    loading,
    page,
    pageSize,
    setPage,
    total,
    filters,
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
  const [overrideKeys, setOverrideKeys] = useState<Set<string> | null>(null)
  const seenDefaultRef = useRef(defaultExpandedKeys)
  if (seenDefaultRef.current !== defaultExpandedKeys) {
    seenDefaultRef.current = defaultExpandedKeys
    setOverrideKeys(null)
  }
  const expandedDateKeys = overrideKeys ?? defaultExpandedKeys

  if (loading) return <PageLoading message={TIMELINE_MESSAGES.tab.loadingMessage} />
  if (error) return <Alert variant="error" message={error} />

  const totalPages = getTotalPages(total, pageSize)

  const toggleDate = (date: string) =>
    setOverrideKeys((current) => {
      const next = new Set(current ?? defaultExpandedKeys)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })

  const allExpanded = timelineGroups.length > 0 && expandedDateKeys.size === timelineGroups.length
  const toggleExpandAll = () =>
    setOverrideKeys(allExpanded ? new Set() : new Set(timelineGroups.map((g) => g.date)))

  return (
    <div className="space-y-4">
      <TimelineFilterPanel
        total={total}
        lastEventTimestamp={lastEventTimestamp}
        searchTerm={filters.searchTerm}
        onSearchChange={filters.setSearchTerm}
        typeFilters={filters.typeFilters}
        onTypeFiltersChange={filters.setTypeFilters}
        importantOnly={filters.importantOnly}
        onImportantOnlyChange={filters.setImportantOnly}
        onClearFilters={filters.clearFilters}
        allExpanded={allExpanded}
        onToggleExpandAll={toggleExpandAll}
      />

      <TimelineCard
        events={filteredEvents}
        expandedDateKeys={expandedDateKeys}
        onToggleDate={toggleDate}
        hasActiveFilters={filters.hasActiveFilters}
        onClearFilters={filters.clearFilters}
      />

      {totalPages > 1 && (
        <PaginationCard
          page={page}
          totalPages={totalPages}
          total={total}
          label={TIMELINE_MESSAGES.tab.paginationLabel}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

ClientTimelineTab.displayName = 'ClientTimelineTab'
