import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { parsePositiveInt } from '../../../utils/utils'
import { useBinderDetail } from './useBinderDetail'
import type { BinderResponse } from '../types'

export const useBinderSelection = (pageItems: BinderResponse[], pinnedClientId?: number) => {
  const { searchParams, setSearchParams } = useSearchParamFilters()

  const deepLinkBinderId = parsePositiveInt(searchParams.get('binder_id'), 0) || undefined

  const pageMatch = pageItems.find((b) => b.id === deepLinkBinderId) ?? null
  const needsFallback = deepLinkBinderId !== undefined && pageMatch === null
  const binderDetailQuery = useBinderDetail(needsFallback ? (deepLinkBinderId ?? null) : null)
  // Context isolation: on a client-pinned tab, never accept a fallback binder that
  // belongs to a different client (a crafted ?binder_id deep link must not open or
  // wire actions to another client's binder).
  const fallbackBinder = binderDetailQuery.data ?? null
  const fallbackAllowed =
    fallbackBinder != null && (pinnedClientId === undefined || fallbackBinder.client_record_id === pinnedClientId)
  const selectedBinder = pageMatch ?? (fallbackAllowed ? fallbackBinder : null)

  const handleSelectBinder = (binder: { id: number }) => {
    const next = new URLSearchParams(searchParams)
    next.set('binder_id', String(binder.id))
    setSearchParams(next, { replace: true })
  }

  const handleCloseDrawer = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('binder_id')
    setSearchParams(next, { replace: true })
  }

  return { deepLinkBinderId, selectedBinder, handleSelectBinder, handleCloseDrawer }
}
