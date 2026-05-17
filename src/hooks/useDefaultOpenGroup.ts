import { useMemo } from 'react'
import { format } from 'date-fns'

export function useDefaultOpenGroup<T>(
  groups: T[],
  getKey: (group: T) => string,
  getDueDate: (group: T) => string | null | undefined,
): string | null {
  return useMemo(() => {
    const todayKey = format(new Date(), 'yyyy-MM-dd')
    const withDate = groups.filter((g) => getDueDate(g))

    const upcoming = withDate
      .filter((g) => getDueDate(g)! >= todayKey)
      .sort((a, b) => getDueDate(a)!.localeCompare(getDueDate(b)!))

    if (upcoming[0]) return getKey(upcoming[0])

    const latestPast = withDate.sort((a, b) => getDueDate(b)!.localeCompare(getDueDate(a)!)).at(0)
    return latestPast ? getKey(latestPast) : groups[0] ? getKey(groups[0]) : null
  }, [groups, getKey, getDueDate])
}
