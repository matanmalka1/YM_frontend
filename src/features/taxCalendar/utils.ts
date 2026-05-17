import type { TaxCalendarGroup } from './api'

export type TaxCalendarGroupStatusFilter = 'all' | 'open' | 'overdue' | 'done'

export const filterGroupsByStatus = (
  groups: TaxCalendarGroup[],
  status: TaxCalendarGroupStatusFilter,
): TaxCalendarGroup[] => {
  if (status === 'open') return groups.filter((group) => group.open_count > 0)
  if (status === 'overdue') return groups.filter((group) => group.overdue_count > 0)
  if (status === 'done') return groups.filter((group) => group.done_count > 0)
  return groups
}
