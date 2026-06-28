import { useMemo } from 'react'
import { useActiveUserOptions } from './useActiveUserOptions'
import { USERS_MESSAGES } from '../messages'

/**
 * Active users as `{ value, label }` filter options, prefixed with an
 * "all users" sentinel. Shared by every list page that filters by assignee.
 * Also exposes `isPending` for disabling the filter while users load.
 */
export const useActiveUserFilterOptions = (enabled = true) => {
  const usersQuery = useActiveUserOptions(enabled)
  const options = useMemo(
    () => [
      { value: '', label: USERS_MESSAGES.filters.allUsers },
      ...(usersQuery.data?.items ?? []).map((user) => ({ value: String(user.id), label: user.full_name })),
    ],
    [usersQuery.data?.items],
  )
  return { options, isPending: usersQuery.isPending }
}
