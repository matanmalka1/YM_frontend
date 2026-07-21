import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { timelineApi, timelineQK } from '../api'
import { getErrorMessage, isPositiveInt } from '../../../utils/utils'
import { PAGE_SIZE_SM } from '@/constants/pagination.constants'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import type { TimelineEvent } from '../api'
import { normalizeTimelineEvents, type NormalizedTimelineEvent, type TimelineFilterKey } from '../normalize'
import { TIMELINE_ERROR_MESSAGES } from '../errorMessages'

const GROUP_FILTERS = ['finance', 'binders', 'documents', 'tax', 'changes'] as const satisfies readonly TimelineFilterKey[]
type TimelineGroupFilter = (typeof GROUP_FILTERS)[number]

const isTimelineGroupFilter = (value: string): value is TimelineGroupFilter => GROUP_FILTERS.some((filter) => filter === value)

const parseTypeFilters = (value: string | null): TimelineGroupFilter[] => value?.split(',').filter(isTimelineGroupFilter) ?? []

const FILTER_GROUP_TO_EVENT_TYPES: Record<TimelineGroupFilter, string[]> = {
  finance: ['charge_created', 'charge_issued', 'charge_paid', 'invoice_attached', 'charge_changed'],
  binders: ['binder_received', 'binder_handed_over', 'binder_lifecycle_change'],
  documents: [
    'document_uploaded',
    'signature_request_sent',
    'signature_request_signed',
    'signature_request_declined',
    'signature_request_canceled',
    'signature_request_expired',
  ],
  tax: ['annual_report_status_changed', 'annual_report_changed'],
  changes: ['client_record_changed', 'business_changed', 'charge_changed', 'annual_report_changed'],
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useClientTimelinePage = (clientId: string | undefined) => {
  const { searchParams, getParam, getPage, setFilter, setFilters, setPage: setPageParam } = useSearchParamFilters()

  const page = getPage()
  const searchTerm = getParam('search')
  const importantOnly = searchParams.get('important_only') === 'true'
  const rawTypeFilters = searchParams.get('type_filters')
  const typeFilters = parseTypeFilters(rawTypeFilters)
  const dateFrom = getParam('date_from')
  const dateTo = getParam('date_to')

  const clientIdNumber = Number(clientId ?? 0)
  const hasValidClient = isPositiveInt(clientIdNumber)

  // ── Resolve event_type list to send to backend ─────────────────────────────

  const hasGroupedFilter = typeFilters.length > 0
  // Keyed on the raw param string (a stable primitive) so the resolved array keeps a
  // steady identity across renders — safe to use directly in the query-params deps below.
  const eventTypeParam = useMemo<string[] | undefined>(() => {
    const keys = parseTypeFilters(rawTypeFilters)
    if (keys.length === 0) return undefined
    return keys.flatMap((key) => FILTER_GROUP_TO_EVENT_TYPES[key])
  }, [rawTypeFilters])

  // ── Query ──────────────────────────────────────────────────────────────────

  const timelineParams = useMemo(
    () => ({
      page,
      search: searchTerm || undefined,
      event_type: eventTypeParam,
      important_only: importantOnly || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [page, searchTerm, importantOnly, eventTypeParam, dateFrom, dateTo],
  )

  const {
    data: timelineData,
    error: timelineError,
    isPending: timelinePending,
  } = useQuery({
    enabled: hasValidClient,
    queryKey: timelineQK.clientEvents(clientIdNumber, timelineParams),
    queryFn: () => timelineApi.getClientTimeline(clientIdNumber, timelineParams),
  })

  const events = useMemo<TimelineEvent[]>(() => timelineData?.events ?? [], [timelineData?.events])

  // ── Derived timeline model ─────────────────────────────────────────────────

  const { historicalEvents } = useMemo(() => normalizeTimelineEvents(events), [events])

  const lastEventTimestamp = useMemo<string | null>(() => {
    if (historicalEvents.length === 0) return null
    return historicalEvents.reduce(
      (latest, { timestamp }) => (new Date(timestamp) > new Date(latest) ? timestamp : latest),
      historicalEvents[0].timestamp,
    )
  }, [historicalEvents])

  const hasActiveFilters =
    hasGroupedFilter || searchTerm.trim().length > 0 || importantOnly || Boolean(dateFrom) || Boolean(dateTo)

  // ── Navigation helpers ─────────────────────────────────────────────────────

  const setPage = (nextPage: number) => setPageParam(nextPage)

  // ── Filter helpers ─────────────────────────────────────────────────────────

  const setSearchTerm = (value: string) => setFilter('search', value)

  const setImportantOnly = (value: boolean) => setFilter('important_only', value ? 'true' : '')

  const setTypeFilters = (value: string) => setFilter('type_filters', parseTypeFilters(value).join(','))

  const setDateRange = (key: 'date_from' | 'date_to', value: string) => setFilter(key, value)

  const clearFilters = () => setFilters({ search: '', important_only: '', type_filters: '', date_from: '', date_to: '' })

  // ── Error ──────────────────────────────────────────────────────────────────

  const error = !hasValidClient
    ? 'מזהה לקוח חסר'
    : timelineError
      ? getErrorMessage(timelineError, TIMELINE_ERROR_MESSAGES.clientTimelineLoad)
      : null

  // ── Public API ─────────────────────────────────────────────────────────────

  return {
    loading: timelinePending,
    error,

    page,
    pageSize: timelineData?.page_size ?? PAGE_SIZE_SM,
    total: timelineData?.total ?? 0,
    setPage,

    filteredEvents: historicalEvents as NormalizedTimelineEvent[],
    filters: {
      searchTerm,
      setSearchTerm,
      typeFilters,
      setTypeFilters,
      importantOnly,
      setImportantOnly,
      dateFrom,
      dateTo,
      setDateRange,
      clearFilters,
      hasActiveFilters,
    },

    summary: {
      totalOnPage: historicalEvents.length,
      lastEventTimestamp,
    },
  }
}
