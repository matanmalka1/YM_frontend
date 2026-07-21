import type { PaginatedClientMatches, SearchClientMatch } from '../api/contracts'
import type { SearchFilters } from '../types'

/**
 * Filters that decide which clients the term resolves to. Changing any of them can exclude
 * the client that was picked under the previous ones, so each change restarts resolution.
 * `client_record_id` is absent on purpose: it is the selection itself, not a filter over it.
 */
export const SEARCH_RESOLUTION_FILTER_KEYS = [
  'search',
  'client_status',
  'entity_type',
  'binder_location_status',
  'binder_capacity_status',
] as const

export type SearchResolutionFilterKey = (typeof SEARCH_RESOLUTION_FILTER_KEYS)[number]

export const isResolutionFilterKey = (name: keyof SearchFilters): name is SearchResolutionFilterKey =>
  SEARCH_RESOLUTION_FILTER_KEYS.some((key) => key === name)

/**
 * The client the backend resolved the current filters to, and the page's only selection truth.
 * The backend feeds items for exactly one resolved client, so a single match is that client and
 * anything else — no match, several matches, a stale id the filters exclude — is no selection.
 *
 * `requestedClientId` only ever narrows: a response still in flight is answered by the previous
 * one, and that one may name a different client than the URL now asks for.
 */
export const resolveSelectedClient = (
  clients: PaginatedClientMatches | undefined,
  requestedClientId: number | null,
): SearchClientMatch | null => {
  const resolved = clients?.total === 1 ? (clients.items[0] ?? null) : null
  if (resolved === null) return null
  return requestedClientId === null || resolved.id === requestedClientId ? resolved : null
}

/**
 * The URL write for a resolution filter: the new value plus the selection it invalidates, in
 * one atomic update. Written apart so no handler can change a filter and leave the old client,
 * its expanded type, or its page behind.
 */
export const resolutionFilterUpdate = (name: SearchResolutionFilterKey, value: string): Record<string, string> => ({
  // Whitespace is not a term: it would reach the backend as a `%%` pattern matching every client.
  [name]: value.trim(),
  client_record_id: '',
  type: '',
})

/**
 * The URL write for picking, switching, or clearing the client. The expanded type belongs to the
 * previous client's groups, so it never survives the change.
 */
export const clientSelectionUpdate = (clientRecordId: number | null): Record<string, string> => ({
  client_record_id: clientRecordId === null ? '' : String(clientRecordId),
  type: '',
})
