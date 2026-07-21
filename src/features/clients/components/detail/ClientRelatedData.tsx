import { type FC } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { formatCount } from '../../../../utils/utils'
import { Card } from '../../../../components/ui/primitives/Card'
import { CLIENT_ROUTES } from '../../api/endpoints'
import { CLIENTS_MESSAGES } from '../../messages'

type RelatedSummaryRowProps = {
  label: string
  count: number
  href: string
  isLoading: boolean
}

const RelatedSummaryRow: FC<RelatedSummaryRowProps> = ({ label, count, href, isLoading }) => (
  <Link
    to={href}
    className="group flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-primary-200 hover:bg-primary-50/40"
  >
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-semibold text-gray-900">{label}</span>
      {isLoading ? (
        <SkeletonBlock height="h-4" width="w-8" />
      ) : (
        <span className="text-sm font-semibold text-primary-600">{formatCount(count)}</span>
      )}
    </div>
    <span className="flex items-center gap-1 text-xs font-medium text-primary-600">
      {CLIENTS_MESSAGES.relatedData.viewTab}
      <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
    </span>
  </Link>
)

type ClientRelatedDataProps = {
  clientId: number
  bindersTotal: number
  chargesTotal: number
  isFetching: boolean
}

export const ClientRelatedData: FC<ClientRelatedDataProps> = ({ clientId, bindersTotal, chargesTotal, isFetching }) => (
  <Card title={CLIENTS_MESSAGES.relatedData.cardTitle} size="compact">
    <div className="grid gap-3 md:grid-cols-2">
      <RelatedSummaryRow
        label={CLIENTS_MESSAGES.relatedData.bindersLabel}
        count={bindersTotal}
        href={CLIENT_ROUTES.tab(clientId, 'binders')}
        isLoading={isFetching}
      />
      <RelatedSummaryRow
        label={CLIENTS_MESSAGES.relatedData.chargesLabel}
        count={chargesTotal}
        href={CLIENT_ROUTES.tab(clientId, 'charges')}
        isLoading={isFetching}
      />
    </div>
  </Card>
)
