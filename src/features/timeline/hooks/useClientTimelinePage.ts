import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { timelineApi, timelineQK } from '../api'
import { getErrorMessage, isPositiveInt, parsePositiveInt } from '../../../utils/utils'
import { useActionRunner } from '@/features/actions'
import type { TimelineEvent } from '../api'
import { normalizeTimelineEvents, type NormalizedTimelineEvent, type TimelineFilterKey } from '../normalize'
import { buildTimelineFilterStats, type EventTypeStat } from '../lib/timelineStats'

export type { EventTypeStat }

const eventMatchesFilters = (
  event: NormalizedTimelineEvent,
  filters: TimelineFilterKey[],
  hasGroupedFilter: boolean,
): boolean => !hasGroupedFilter || event.filterKeys.some((key) => filters.includes(key))

const eventMatchesSearch = (event: NormalizedTimelineEvent, query: string, includeIds = false): boolean =>
  !query ||
  event.title.toLowerCase().includes(query) ||
  event.secondary?.toLowerCase().includes(query) ||
  event.relatedEntity?.toLowerCase().includes(query) ||
  event.description?.toLowerCase().includes(query) ||
  (includeIds && event.binder_id != null && String(event.binder_id).includes(query)) ||
  (includeIds && event.charge_id != null && String(event.charge_id).includes(query))

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useClientTimelinePage = (clientId: string | undefined) => {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parsePositiveInt(searchParams.get('page'), 1)
  const pageSize = parsePositiveInt(searchParams.get('page_size'), 50)

  const clientIdNumber = Number(clientId ?? 0)
  const hasValidClient = isPositiveInt(clientIdNumber)

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilters, setTypeFilters] = useState<TimelineFilterKey[]>(['all'])

  // ── Query ──────────────────────────────────────────────────────────────────

  const timelineParams = useMemo(() => ({ page, page_size: pageSize }), [page, pageSize])

  const timelineQuery = useQuery({
    enabled: hasValidClient,
    queryKey: timelineQK.clientEvents(clientIdNumber, timelineParams),
    queryFn: () => timelineApi.getClientTimeline(clientIdNumber, timelineParams),
  })

  const events = useMemo<TimelineEvent[]>(() => timelineQuery.data?.events ?? [], [timelineQuery.data?.events])

  // ── Derived timeline model ─────────────────────────────────────────────────

  const { historicalEvents } = useMemo(() => normalizeTimelineEvents(events), [events])

  const eventTypeStats = useMemo<EventTypeStat[]>(() => buildTimelineFilterStats(historicalEvents), [historicalEvents])

  const lastEventTimestamp = useMemo<string | null>(() => {
    if (historicalEvents.length === 0) return null
    return historicalEvents.reduce(
      (latest, { timestamp }) => (new Date(timestamp) > new Date(latest) ? timestamp : latest),
      historicalEvents[0].timestamp,
    )
  }, [historicalEvents])

  // ── Filtering ──────────────────────────────────────────────────────────────

  const hasGroupedFilter = typeFilters.length > 0 && !typeFilters.includes('all')
  const hasActiveFilters = hasGroupedFilter || searchTerm.trim().length > 0

  const filteredEvents = useMemo<NormalizedTimelineEvent[]>(() => {
    if (!hasActiveFilters) return historicalEvents

    const query = searchTerm.trim().toLowerCase()

    return historicalEvents.filter((event) => {
      return eventMatchesFilters(event, typeFilters, hasGroupedFilter) && eventMatchesSearch(event, query, true)
    })
  }, [historicalEvents, searchTerm, typeFilters, hasActiveFilters, hasGroupedFilter])

  // ── Actions ────────────────────────────────────────────────────────────────

  const { activeActionKey, cancelPendingAction, confirmPendingAction, handleAction, pendingAction } = useActionRunner({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: timelineQK.clientRoot(clientIdNumber) }),
    errorFallback: 'שגיאה בביצוע פעולה',
    canonicalAction: true,
  })

  // ── Navigation helpers ─────────────────────────────────────────────────────

  const setPage = (nextPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(nextPage))
      return next
    })
  }

  const setPageSize = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page_size', value)
      next.set('page', '1')
      return next
    })
  }

  // ── Filter helpers ─────────────────────────────────────────────────────────

  const toggleTypeFilter = (type: TimelineFilterKey) =>
    setTypeFilters((prev) => {
      if (type === 'all') return ['all']
      const withoutAll = prev.filter((item) => item !== 'all')
      const next = withoutAll.includes(type) ? withoutAll.filter((item) => item !== type) : [...withoutAll, type]
      return next.length === 0 ? ['all'] : next
    })

  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilters(['all'])
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  const error = !hasValidClient
    ? 'מזהה לקוח חסר'
    : timelineQuery.error
      ? getErrorMessage(timelineQuery.error, 'שגיאה בטעינת ציר זמן')
      : null

  // ── Public API ─────────────────────────────────────────────────────────────

  return {
    loading: timelineQuery.isPending,
    refreshing: timelineQuery.isRefetching,
    refresh: () => timelineQuery.refetch(),
    error,

    page,
    pageSize,
    total: timelineQuery.data?.total ?? 0,
    setPage,
    setPageSize,

    filteredEvents,
    eventTypeStats,

    activeActionKey,
    handleAction,
    pendingAction,
    confirmPendingAction,
    cancelPendingAction,

    filters: {
      searchTerm,
      setSearchTerm,
      typeFilters,
      toggleTypeFilter,
      clearFilters,
      hasActiveFilters,
    },

    summary: {
      totalOnPage: filteredEvents.length,
      lastEventTimestamp,
    },
  }
}
