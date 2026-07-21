import type { SearchMatchGroups, SearchMatchType } from '../api/contracts'
import { SEARCH_GROUP_ORDER, SEARCH_GROUP_TYPES } from '../constants'

/** One type chip: the type and the exact total behind its preview. */
export interface SearchMatchChip {
  type: SearchMatchType
  count: number
}

/** A chip per type that has matches, in display order — the exact totals, not preview sizes. */
export const searchMatchChips = (groups: SearchMatchGroups): SearchMatchChip[] =>
  SEARCH_GROUP_ORDER.filter((key) => groups[key].total > 0).map((key) => ({
    type: SEARCH_GROUP_TYPES[key],
    count: groups[key].total,
  }))

/**
 * The `page` rule: one URL param pages whichever list the user is in. With no type expanded it
 * pages the clients list; with a type expanded it pages that type's match list, and the clients
 * section shows its first page without a pager.
 */
export const clientsPageFor = (activeType: SearchMatchType | null, page: number): number => (activeType === null ? page : 1)
