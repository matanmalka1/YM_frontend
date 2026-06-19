import type { ChargeListItem } from '../../api'

export const ChargeClientCell = ({ charge }: { charge: ChargeListItem }) => {
  const clientName = charge.client_name ?? `לקוח #${charge.client_record_id}`

  return (
    <div className="min-w-0">
      <div className="truncate font-semibold text-gray-900">{clientName}</div>
      {charge.business_name && <div className="mt-0.5 truncate text-xs text-gray-500">עסק: {charge.business_name}</div>}
    </div>
  )
}
