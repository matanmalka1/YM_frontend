import { type FC, type ReactNode } from 'react'
import { ChevronLeft, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { Button } from '../../../../components/ui/primitives/Button'
import { Card } from '../../../../components/ui/primitives/Card'
import type { ChargeResponse } from '@/features/charges'
import type { BinderDetailResponse } from '@/features/binders'
import { getChargeTypeLabel } from '@/features/charges'
import { getChargeStatusLabel, getStatusLabel as getBinderStatusLabel } from '../../../../utils/enums'
import { formatBinderNumber } from '../../../../utils/utils'

type RelatedItemsSectionProps<T> = {
  title: string
  total: number
  allHref: string
  items: T[]
  emptyText: string
  getKey: (item: T) => number
  getTitle: (item: T) => ReactNode
  getSubtitle: (item: T) => ReactNode
  getBadge?: (item: T) => ReactNode
  getItemHref: (item: T) => string
}

const RelatedItemsSection = <T,>({
  title,
  total,
  allHref,
  items,
  emptyText,
  getKey,
  getTitle,
  getSubtitle,
  getBadge,
  getItemHref,
}: RelatedItemsSectionProps<T>) => (
  <section className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
    <div className="mb-2 flex items-center justify-between gap-3">
      <h3 className="text-xs font-semibold text-gray-700">{title}</h3>
      {total > 0 && (
        <Link to={allHref} className="text-xs font-medium text-primary-600 hover:underline">
          הכל ({total})
        </Link>
      )}
    </div>
    {items.length === 0 ? (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-center text-xs text-gray-500">
        {emptyText}
      </div>
    ) : (
      <div className="divide-y divide-gray-100">
        {items.slice(0, 3).map((item) => (
          <Link
            key={getKey(item)}
            to={getItemHref(item)}
            className="group flex items-center justify-between gap-2 py-1.5 transition-colors hover:bg-gray-50"
          >
            <div className="min-w-0 text-right">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className="truncate text-xs font-semibold text-gray-900">{getTitle(item)}</span>
                {getBadge?.(item)}
              </div>
              <div className="truncate text-[11px] text-gray-500">{getSubtitle(item)}</div>
            </div>
            <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-primary-600" />
          </Link>
        ))}
      </div>
    )}
  </section>
)

type ClientRelatedDataProps = {
  clientId: number
  binders: BinderDetailResponse[]
  bindersTotal: number
  charges: ChargeResponse[]
  chargesTotal: number
  canViewCharges: boolean
  canCreateCharge?: boolean
  onCreateCharge?: () => void
  onCreateBinder?: () => void
}

export const ClientRelatedData: FC<ClientRelatedDataProps> = ({
  clientId,
  binders,
  bindersTotal,
  charges,
  chargesTotal,
  canViewCharges,
  canCreateCharge,
  onCreateCharge,
  onCreateBinder,
}) => {
  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" size="sm" onClick={onCreateBinder} className="text-md">
        <Plus className="h-3.5 w-3.5" />
        הוסף קלסר
      </Button>
      {canCreateCharge && (
        <Button variant="ghost" size="sm" onClick={onCreateCharge} className="text-md">
          <Plus className="h-3.5 w-3.5" />
          הוסף חיוב
        </Button>
      )}
    </div>
  )

  return (
    <Card title="נתונים קשורים" actions={actions} size="compact" className="shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <RelatedItemsSection
          title="קלסרים אחרונים"
          total={bindersTotal}
          allHref={`/binders?client_record_id=${clientId}`}
          items={binders}
          emptyText="אין קלסרים להצגה"
          getKey={(binder) => binder.id}
          getTitle={(binder) => `קלסר ${formatBinderNumber(binder.binder_number)}`}
          getSubtitle={(binder) => getBinderStatusLabel(binder.status)}
          getItemHref={(binder) => `/binders?client_record_id=${clientId}&binder_id=${binder.id}`}
        />
        {canViewCharges && (
          <RelatedItemsSection
            title="חיובים אחרונים"
            total={chargesTotal}
            allHref={`/charges?client_record_id=${clientId}`}
            items={charges}
            emptyText="אין חיובים להצגה"
            getKey={(charge) => charge.id}
            getTitle={(charge) => `חיוב #${charge.id}`}
            getSubtitle={(charge) => getChargeTypeLabel(charge.charge_type)}
            getBadge={(charge) => <Badge variant="neutral">{getChargeStatusLabel(charge.status)}</Badge>}
            getItemHref={() => `/charges?client_record_id=${clientId}`}
          />
        )}
      </div>
    </Card>
  )
}
