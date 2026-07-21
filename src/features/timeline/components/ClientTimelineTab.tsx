import { useMemo, useRef, useState } from 'react'
import { useClientTimelinePage } from '../hooks/useClientTimelinePage'
import { TimelineFilterPanel } from './TimelineFilterPanel'
import { TimelineCard } from './TimelineCard'
import { groupTimelineEventsByDate, getDefaultOpenTimelineGroups } from '../lib/timelineGroups'
import { PaginationCard } from '@/components/ui/table'
import { getTotalPages } from '../../../utils/paginationUtils'
import { DetailTabPanel } from '@/components/ui/layout'
import { SkeletonBlock } from '../../../components/ui/primitives/SkeletonBlock'
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
    () => (filters.hasActiveFilters ? new Set(timelineGroups.map((g) => g.date)) : getDefaultOpenTimelineGroups(timelineGroups)),
    [timelineGroups, filters.hasActiveFilters],
  )
  const [overrideKeys, setOverrideKeys] = useState<Set<string> | null>(null)
  const seenDefaultRef = useRef(defaultExpandedKeys)
  if (seenDefaultRef.current !== defaultExpandedKeys) {
    seenDefaultRef.current = defaultExpandedKeys
    setOverrideKeys(null)
  }
  const expandedDateKeys = overrideKeys ?? defaultExpandedKeys

  const totalPages = getTotalPages(total, pageSize)

  const toggleDate = (date: string) =>
    setOverrideKeys((current) => {
      const next = new Set(current ?? defaultExpandedKeys)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })

  const allExpanded = timelineGroups.length > 0 && expandedDateKeys.size === timelineGroups.length
  const toggleExpandAll = () => setOverrideKeys(allExpanded ? new Set() : new Set(timelineGroups.map((g) => g.date)))

  return (
    <DetailTabPanel
      title={TIMELINE_MESSAGES.clientTab.title}
      subtitle={TIMELINE_MESSAGES.clientTab.subtitle}
      filters={
        <TimelineFilterPanel
          total={total}
          lastEventTimestamp={lastEventTimestamp}
          searchTerm={filters.searchTerm}
          onSearchChange={filters.setSearchTerm}
          typeFilters={filters.typeFilters}
          onTypeFiltersChange={filters.setTypeFilters}
          importantOnly={filters.importantOnly}
          onImportantOnlyChange={filters.setImportantOnly}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateRangeChange={filters.setDateRange}
          onClearFilters={filters.clearFilters}
          allExpanded={allExpanded}
          onToggleExpandAll={toggleExpandAll}
        />
      }
    >
      {error ? (
        <Alert variant="error" message={error} />
      ) : loading ? (
        <div className="space-y-3" aria-label={TIMELINE_MESSAGES.tab.loadingMessage}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} height="h-16" width="w-full" rounded="xl" shimmer />
          ))}
        </div>
      ) : (
        <>
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
        </>
      )}
    </DetailTabPanel>
  )
}

ClientTimelineTab.displayName = 'ClientTimelineTab'
