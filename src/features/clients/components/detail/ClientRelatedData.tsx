import { type FC, type ReactNode, useEffect, useRef } from 'react'
import { ChevronLeft, Plus } from 'lucide-react'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { Link } from 'react-router-dom'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { Button } from '../../../../components/ui/primitives/Button'
import { Card } from '../../../../components/ui/primitives/Card'
import type { ChargeListItem } from '@/features/charges'
import type { BinderDetailResponse } from '@/features/binders'
import { getChargeTypeLabel } from '@/features/charges'
import { getChargeStatusLabel } from '@/features/charges'
import { getBinderLocationStatusLabel } from '@/features/binders'
import { formatBinderNumber } from '../../../../utils/utils'
import { CLIENTS_MESSAGES } from '../../messages'

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
          {CLIENTS_MESSAGES.relatedData.showAll(total)}
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
              <div className="truncate text-2xs text-gray-500">{getSubtitle(item)}</div>
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
  charges: ChargeListItem[]
  chargesTotal: number
  hasRequestedData: boolean
  isFetching: boolean
  canViewCharges: boolean
  canCreateCharge?: boolean
  onCreateCharge?: () => void
  onCreateBinder?: () => void
  onRequestLoad: () => void
}

export const ClientRelatedData: FC<ClientRelatedDataProps> = ({
  clientId,
  binders,
  bindersTotal,
  charges,
  chargesTotal,
  hasRequestedData,
  isFetching,
  canViewCharges,
  canCreateCharge,
  onCreateCharge,
  onCreateBinder,
  onRequestLoad,
}) => {
  const loadTriggerRef = useRef<HTMLDivElement | null>(null)
  const hasAnyRelatedData = bindersTotal > 0 || chargesTotal > 0 || binders.length > 0 || charges.length > 0
  const showInitialLoading = hasRequestedData && isFetching && !hasAnyRelatedData

  useEffect(() => {
    if (hasRequestedData) return

    const node = loadTriggerRef.current
    if (!node) return

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      onRequestLoad()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        onRequestLoad()
        observer.disconnect()
      },
      { rootMargin: '240px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasRequestedData, onRequestLoad])

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={onCreateBinder}>
        {CLIENTS_MESSAGES.relatedData.addBinder}
      </Button>
      {canCreateCharge && (
        <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={onCreateCharge}>
          {CLIENTS_MESSAGES.relatedData.addCharge}
        </Button>
      )}
    </div>
  )

  return (
    <Card title={CLIENTS_MESSAGES.relatedData.cardTitle} actions={actions} size="compact">
      <div ref={loadTriggerRef}>
        {!hasRequestedData ? (
          <div className="min-h-[132px]" />
        ) : showInitialLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: canViewCharges ? 2 : 1 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <SkeletonBlock height="h-3" width="w-24" className="mb-3" />
                <div className="space-y-2">
                  <SkeletonBlock height="h-8" width="w-full" />
                  <SkeletonBlock height="h-8" width="w-full" />
                  <SkeletonBlock height="h-8" width="w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <RelatedItemsSection
              title={CLIENTS_MESSAGES.relatedData.bindersTitle}
              total={bindersTotal}
              allHref={`/binders?client_record_id=${clientId}`}
              items={binders}
              emptyText={CLIENTS_MESSAGES.relatedData.bindersEmpty}
              getKey={(binder) => binder.id}
              getTitle={(binder) => CLIENTS_MESSAGES.relatedData.binderTitle(formatBinderNumber(binder.binder_number))}
              getSubtitle={(binder) => getBinderLocationStatusLabel(binder.location_status)}
              getItemHref={(binder) => `/binders?client_record_id=${clientId}&binder_id=${binder.id}`}
            />
            {canViewCharges && (
              <RelatedItemsSection
                title={CLIENTS_MESSAGES.relatedData.chargesTitle}
                total={chargesTotal}
                allHref={`/charges?client_record_id=${clientId}`}
                items={charges}
                emptyText={CLIENTS_MESSAGES.relatedData.chargesEmpty}
                getKey={(charge) => charge.id}
                getTitle={(charge) => CLIENTS_MESSAGES.relatedData.chargeTitle(charge.id)}
                getSubtitle={(charge) => getChargeTypeLabel(charge.charge_type)}
                getBadge={(charge) => <Badge variant="neutral">{getChargeStatusLabel(charge.status)}</Badge>}
                getItemHref={() => `/charges?client_record_id=${clientId}`}
              />
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
