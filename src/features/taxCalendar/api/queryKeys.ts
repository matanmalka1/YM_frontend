import type { TaxCalendarGroupsParams } from './contracts'

export const taxCalendarQK = {
  groups: (params: TaxCalendarGroupsParams) => ['tax-calendar', 'groups', params] as const,
}
