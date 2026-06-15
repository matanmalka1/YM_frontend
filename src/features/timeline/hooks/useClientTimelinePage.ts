import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { timelineApi, timelineQK } from '../api'
import { getErrorMessage, isPositiveInt, parsePositiveInt } from '../../../utils/utils'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import type { TimelineEvent } from '../api'
import { normalizeTimelineEvents, type NormalizedTimelineEvent, type TimelineFilterKey } from '../normalize'
import { buildTimelineFilterStats, type EventTypeStat } from '../lib/timelineStats'

export type { EventTypeStat }

const FILTER_GROUP_TO_EVENT_TYPES: Record<string, string[]> = {
  finance: ['charge_created', 'charge_issued', 'charge_paid', 'invoice_attached'],
  binders: ['binder_received', 'binder_handed_over', 'binder_lifecycle_change'],
  documents: [
    'document_uploaded',
    'signature_request_sent',
    'signature_request_signed',
    'signature_request_declined',
    'signature_request_canceled',
    'signature_request_expired',
  ],
  tax: ['annual_report_status_changed'],
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useClientTimelinePage = (clientId: string | undefined) => {
  const { searchParams, getParam, getPage, setFilter, setFilters, setPage: setPageParam } = useSearchParamFilters()

  const page = getPage()
  const pageSize = parsePositiveInt(searchParams.get('page_size'), 50)
  const searchTerm = getParam('search')
  const importantOnly = searchParams.get('important_only') === 'true'
  const rawTypeFilters = searchParams.get('type_filters')
  const typeFilters: TimelineFilterKey[] = rawTypeFilters ? (rawTypeFilters.split(',') as TimelineFilterKey[]) : ['all']

  const clientIdNumber = Number(clientId ?? 0)
  const hasValidClient = isPositiveInt(clientIdNumber)

  // ── Resolve event_type list to send to backend ─────────────────────────────

  const hasGroupedFilter = typeFilters.length > 0 && !typeFilters.includes('all')
  const eventTypeParam: string[] | undefined = hasGroupedFilter
    ? typeFilters.flatMap((key) => FILTER_GROUP_TO_EVENT_TYPES[key] ?? [])
    : undefined

  // ── Query ──────────────────────────────────────────────────────────────────

  const timelineParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: searchTerm || undefined,
      event_type: eventTypeParam,
      important_only: importantOnly || undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, pageSize, searchTerm, importantOnly, JSON.stringify(eventTypeParam)],
  )

  const timelineQuery = useQuery({
    enabled: hasValidClient,
    queryKey: timelineQK.clientEvents(clientIdNumber, timelineParams),
    queryFn: () => timelineApi.getClientTimeline(clientIdNumber, timelineParams),
  })

  const events = useMemo<TimelineEvent[]>(() => timelineQuery.data?.events ?? [], [timelineQuery.data?.events])

  // ── Derived timeline model ─────────────────────────────────────────────────

  const { historicalEvents } = useMemo(() => normalizeTimelineEvents(events), [events])

  const lastEventTimestamp = useMemo<string | null>(() => {
    if (historicalEvents.length === 0) return null
    return historicalEvents.reduce(
      (latest, { timestamp }) => (new Date(timestamp) > new Date(latest) ? timestamp : latest),
      historicalEvents[0].timestamp,
    )
  }, [historicalEvents])

  const eventTypeStats = useMemo<EventTypeStat[]>(() => buildTimelineFilterStats(historicalEvents), [historicalEvents])

  const hasActiveFilters = hasGroupedFilter || searchTerm.trim().length > 0 || importantOnly

  // ── Navigation helpers ─────────────────────────────────────────────────────

  const setPage = (nextPage: number) => setPageParam(nextPage)

  const setPageSize = (value: string) => setFilters({ page_size: value })

  // ── Filter helpers ─────────────────────────────────────────────────────────

  const setSearchTerm = (value: string) => setFilter('search', value)

  const setImportantOnly = (value: boolean) => setFilter('important_only', value ? 'true' : '')

  const toggleTypeFilter = (type: TimelineFilterKey) => {
    const current = searchParams.get('type_filters')
    const currentFilters: TimelineFilterKey[] = current ? (current.split(',') as TimelineFilterKey[]) : ['all']

    let updated: TimelineFilterKey[]
    if (type === 'all') {
      updated = ['all']
    } else {
      const withoutAll = currentFilters.filter((item) => item !== 'all')
      updated = withoutAll.includes(type) ? withoutAll.filter((item) => item !== type) : [...withoutAll, type]
      if (updated.length === 0) updated = ['all']
    }

    const nextValue = updated.length === 1 && updated[0] === 'all' ? '' : updated.join(',')
    setFilter('type_filters', nextValue)
  }

  const clearFilters = () => setFilters({ search: '', important_only: '', type_filters: '' })

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

    filteredEvents: historicalEvents as NormalizedTimelineEvent[],
    eventTypeStats,

    filters: {
      searchTerm,
      setSearchTerm,
      typeFilters,
      toggleTypeFilter,
      importantOnly,
      setImportantOnly,
      clearFilters,
      hasActiveFilters,
    },

    summary: {
      totalOnPage: historicalEvents.length,
      lastEventTimestamp,
    },
  }
}
