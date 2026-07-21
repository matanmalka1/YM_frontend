import type { SearchMatchType } from '../api/contracts'
import { SEARCH_GROUP_TYPES } from '../constants'

/**
 * Params the page no longer offers, kept only so old deep links are cleaned rather than
 * honoured: the client selection died with the dossier feed, the four enum filters and the
 * identifier inputs died with the advanced panel. The API rejects them all, so any of these
 * arriving by bookmark is stripped from the URL in one atomic write and the term stands on
 * its own.
 */
export const SEARCH_DROPPED_FILTER_KEYS = [
  'client_record_id',
  'client_status',
  'entity_type',
  'binder_location_status',
  'binder_capacity_status',
  'id_number',
  'binder_number',
] as const

/**
 * The one guarded URL param left on this page. `type` expands a match group, so a value that
 * is not a `SearchMatchType` (including the never-valid `client`) reads as "no expansion" and
 * is cleaned out of the URL rather than sent to a 422.
 */
export const isSearchMatchType = (value: string): value is SearchMatchType =>
  Object.values(SEARCH_GROUP_TYPES).some((type) => type === value)
