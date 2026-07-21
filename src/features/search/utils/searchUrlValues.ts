import { parseClientStatus, parseEntityType, type ClientStatus, type EntityType } from '@/features/clients'
import {
  isBinderCapacityStatus,
  isBinderLocationStatus,
  type BinderCapacityStatus,
  type BinderLocationStatus,
} from '@/features/binders'

/** The filters whose values are backed by a backend enum, and are therefore rejectable. */
export const SEARCH_ENUM_FILTER_KEYS = [
  'client_status',
  'entity_type',
  'binder_location_status',
  'binder_capacity_status',
] as const

export type SearchEnumFilterKey = (typeof SEARCH_ENUM_FILTER_KEYS)[number]

/** Empty string is "no filter" — the value every one of these selects shows as "all". */
export interface SearchEnumFilters {
  client_status: ClientStatus | ''
  entity_type: EntityType | ''
  binder_location_status: BinderLocationStatus | ''
  binder_capacity_status: BinderCapacityStatus | ''
}

export interface ParsedSearchEnumFilters {
  values: SearchEnumFilters
  /** Keys that carried a value the API would reject, so the URL can be cleaned of them. */
  invalidKeys: SearchEnumFilterKey[]
}

const PARSERS: { [K in SearchEnumFilterKey]: (raw: string) => SearchEnumFilters[K] | undefined } = {
  client_status: parseClientStatus,
  entity_type: parseEntityType,
  binder_location_status: (raw) => (isBinderLocationStatus(raw) ? raw : undefined),
  binder_capacity_status: (raw) => (isBinderCapacityStatus(raw) ? raw : undefined),
}

/**
 * Parse the enum-backed filters out of raw URL strings. A hand-edited URL or an old bookmark can
 * carry a value the API no longer accepts, and sending it on would fail the whole search with a
 * 422 rather than the one filter. An unsupported value therefore parses to "all", and its key is
 * reported so the URL can drop it instead of keeping a filter that does nothing.
 */
export const parseSearchEnumFilters = (raw: Record<SearchEnumFilterKey, string>): ParsedSearchEnumFilters => {
  const values = {} as SearchEnumFilters
  const invalidKeys: SearchEnumFilterKey[] = []

  for (const key of SEARCH_ENUM_FILTER_KEYS) {
    const parsed = PARSERS[key](raw[key])
    values[key] = (parsed ?? '') as never
    if (raw[key] && parsed === undefined) invalidKeys.push(key)
  }

  return { values, invalidKeys }
}
