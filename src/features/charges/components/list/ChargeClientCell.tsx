import type { ChargeListItem } from '../../api'
import { CHARGES_MESSAGES } from '../../messages'

export const ChargeClientCell = ({ charge }: { charge: ChargeListItem }) => {
  const clientName = charge.client_name ?? CHARGES_MESSAGES.list.clientFallback(charge.client_record_id)

  return (
    <div className="min-w-0">
      <div className="truncate font-semibold text-gray-900">{clientName}</div>
      {charge.business_name && <div className="mt-0.5 truncate text-xs text-gray-500">{CHARGES_MESSAGES.list.businessPrefix(charge.business_name)}</div>}
    </div>
  )
}
