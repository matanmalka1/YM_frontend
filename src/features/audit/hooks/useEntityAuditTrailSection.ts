import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { FilterFieldDef } from '@/components/ui/filters/types'
import { usersApi, usersQK } from '@/features/users'
import { useRole } from '@/hooks/useRole'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { getTotalPages } from '@/utils/paginationUtils'
import { parsePositiveInt } from '@/utils/utils'
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ACTIONS_BY_ENTITY_TYPE,
  AUDIT_PAGE_SIZE,
  AUDIT_USERS_LIST_PARAMS,
} from '../constants'
import type { EntityAuditTrailParams, EntityAuditType } from '../api'
import { useEntityAuditTrail } from './useEntityAuditTrail'

type AuditTrailFilters = Omit<EntityAuditTrailParams, 'page' | 'page_size'>

export const useEntityAuditTrailSection = (entityType: EntityAuditType, entityId: number) => {
  const { getParam, setFilters } = useSearchParamFilters()

  const keys = useMemo(() => {
    const keyPrefix = `${entityType}_${entityId}_audit_`
    return {
      action: `${keyPrefix}action`,
      userId: `${keyPrefix}user_id`,
      createdAfter: `${keyPrefix}created_after`,
      createdBefore: `${keyPrefix}created_before`,
    }
  }, [entityId, entityType])

  const [page, setPage] = useState(0)
  const action = getParam(keys.action)
  const userId = getParam(keys.userId)
  const userIdValue = parsePositiveInt(userId, 0)
  const selectedUserId = userIdValue ? String(userIdValue) : ''
  const createdAfter = getParam(keys.createdAfter)
  const createdBefore = getParam(keys.createdBefore)

  const handleFilterChange = (key: string, value: string) => {
    setPage(0)
    setFilters({ [key]: value }, false)
  }

  const handleFilterReset = () => {
    setPage(0)
    setFilters(
      {
        [keys.action]: '',
        [keys.userId]: '',
        [keys.createdAfter]: '',
        [keys.createdBefore]: '',
      },
      false,
    )
  }

  const handlePageChange = (nextPage: number) => setPage(nextPage)

  const { isAdvisor } = useRole()

  const { data: usersData } = useQuery({
    queryKey: usersQK.list(AUDIT_USERS_LIST_PARAMS),
    queryFn: () => usersApi.list(AUDIT_USERS_LIST_PARAMS),
    enabled: isAdvisor,
  })

  const availableActions = AUDIT_ACTIONS_BY_ENTITY_TYPE[entityType] ?? Object.keys(AUDIT_ACTION_LABELS)
  const selectedAction = availableActions.includes(action) ? action : ''
  const actionOptions = [
    { value: '', label: 'כל הפעולות' },
    ...availableActions.map((value) => ({ value, label: AUDIT_ACTION_LABELS[value] ?? value })),
  ]

  const filters: AuditTrailFilters = {
    action: selectedAction || undefined,
    user_id: userIdValue || undefined,
    created_after: createdAfter || undefined,
    created_before: createdBefore ? `${createdBefore}T23:59:59.999` : undefined,
  }

  const query = useEntityAuditTrail(entityType, entityId, page, AUDIT_PAGE_SIZE, filters)
  const totalPages = getTotalPages(query.total, AUDIT_PAGE_SIZE)
  const maxPage = totalPages - 1
  const safePage = Math.min(page, maxPage)

  useEffect(() => {
    if (query.isPending || page <= maxPage) return
    setPage(maxPage)
  }, [maxPage, page, query.isPending])

  const userOptions = useMemo(() => {
    const auditActors = new Map<number, string>()
    for (const entry of query.items) {
      // performed_by is null for system / external-signer rows — skip; they are
      // identified by actor_display_name, not a users.id, and aren't filterable.
      if (entry.performed_by == null) continue
      auditActors.set(entry.performed_by, entry.performed_by_name ?? `#${entry.performed_by}`)
    }
    for (const user of usersData?.items ?? []) {
      auditActors.set(user.id, user.full_name)
    }
    if (userIdValue && !auditActors.has(userIdValue)) {
      auditActors.set(userIdValue, `#${userIdValue}`)
    }

    return [
      { value: '', label: 'כל המשתמשים' },
      ...Array.from(auditActors, ([id, label]) => ({ value: String(id), label })),
    ]
  }, [query.items, userIdValue, usersData?.items])

  const filterFields: FilterFieldDef[] = [
    { type: 'select', key: keys.action, label: 'פעולה', options: actionOptions },
    { type: 'select', key: keys.userId, label: 'משתמש', options: userOptions },
    {
      type: 'date-range',
      fromKey: keys.createdAfter,
      toKey: keys.createdBefore,
      fromLabel: 'מתאריך',
      toLabel: 'עד תאריך',
    },
  ]

  return {
    filterFields,
    filterValues: {
      [keys.action]: selectedAction,
      [keys.userId]: selectedUserId,
      [keys.createdAfter]: createdAfter,
      [keys.createdBefore]: createdBefore,
    },
    handleFilterChange,
    handleFilterReset,
    handlePageChange,
    hasActiveFilters: Boolean(selectedAction || selectedUserId || createdAfter || createdBefore),
    items: query.items,
    total: query.total,
    pageSize: AUDIT_PAGE_SIZE,
    safePage,
    isError: query.isError,
    isFetching: query.isFetching,
    isPending: query.isPending,
    refetch: query.refetch,
  }
}
