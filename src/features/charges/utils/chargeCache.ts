import type { QueryClient, QueryKey } from '@tanstack/react-query'
import type { ChargeResponse, ChargesListParams, ChargesListResponse } from '../api/contracts'

const isChargesListKey = (queryKey: QueryKey): queryKey is readonly ['charges', 'list', ChargesListParams] =>
  queryKey[0] === 'charges' && queryKey[1] === 'list'

const matchesList = (charge: ChargeResponse, params: ChargesListParams) =>
  (params.client_record_id == null || params.client_record_id === charge.client_record_id) &&
  (params.business_id == null || params.business_id === charge.business_id) &&
  (params.status == null || params.status === charge.status) &&
  (params.charge_type == null || params.charge_type === charge.charge_type) &&
  (params.period == null || params.period === charge.period) &&
  params.issued_after == null &&
  params.issued_before == null

export const addCreatedChargeToLists = (queryClient: QueryClient, charge: ChargeResponse) => {
  const lists = queryClient.getQueriesData<ChargesListResponse>({ queryKey: ['charges', 'list'] })

  lists.forEach(([queryKey, current]) => {
    if (!current || !isChargesListKey(queryKey)) return

    const params = queryKey[2] ?? {}
    if (!matchesList(charge, params) || current.items.some((item) => item.id === charge.id)) return

    const page = params.page ?? 1
    const pageSize = params.page_size ?? current.items.length
    const items = page === 1 ? [charge, ...current.items].slice(0, pageSize) : current.items

    queryClient.setQueryData<ChargesListResponse>(queryKey, {
      ...current,
      items,
      total: current.total + 1,
      stats: {
        ...current.stats,
        draft: {
          count: current.stats.draft.count + 1,
          amount: (Number(current.stats.draft.amount) + Number(charge.amount)).toFixed(2),
        },
      },
    })
  })
}
