import type { TaxCalendarGroupItemsParams, TaxCalendarGroupsParams } from './contracts'

export const taxCalendarQK = {
  groups: (params: TaxCalendarGroupsParams) => ['tax-calendar', 'groups', params] as const,
  groupItems: (taxCalendarEntryId: number, params: TaxCalendarGroupItemsParams = {}) =>
    ['tax-calendar', 'groups', taxCalendarEntryId, 'items', params] as const,
}
