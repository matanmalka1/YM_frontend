import type { NormalizedTimelineEvent, TimelineFilterKey } from '../normalize'

export const eventMatchesSearch = (event: NormalizedTimelineEvent, query: string): boolean =>
  !query ||
  event.title.toLowerCase().includes(query) ||
  event.secondary?.toLowerCase().includes(query) ||
  event.relatedEntity?.toLowerCase().includes(query) ||
  event.description?.toLowerCase().includes(query) ||
  (event.binder_id != null && String(event.binder_id).includes(query)) ||
  (event.charge_id != null && String(event.charge_id).includes(query))

export const eventMatchesImportance = (event: NormalizedTimelineEvent, importantOnly: boolean): boolean =>
  !importantOnly || event.importance === 'strong'

export const eventMatchesTypeFilters = (
  event: NormalizedTimelineEvent,
  typeFilters: TimelineFilterKey[],
  hasGroupedFilter: boolean,
): boolean => !hasGroupedFilter || event.filterKeys.some((key) => typeFilters.includes(key))
