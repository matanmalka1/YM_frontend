import { StateCard } from '../../../components/ui/feedback/StateCard'
import { Inbox } from 'lucide-react'
import type { AgingReportItem } from '../api'
import { formatCount, formatDate } from '../../../utils/utils'
import { semanticDotClasses } from '../../../utils/semanticColors'
import { ActionSurfaceLink } from '../../../components/ui/primitives/ActionSurface'
import { Badge } from '../../../components/ui/primitives/Badge'
import { formatILS, toReportNumber, type ReportMoneyValue } from '../utils'
import { REPORTS_MESSAGES } from '../messages'

interface AgingReportCardsProps {
  items: AgingReportItem[]
}

const BUCKETS = [
  { key: 'current', label: REPORTS_MESSAGES.aging.buckets.currentShort, className: semanticDotClasses.info },
  { key: 'days_30', label: REPORTS_MESSAGES.aging.buckets.days30Short, className: semanticDotClasses.neutral },
  { key: 'days_60', label: REPORTS_MESSAGES.aging.buckets.days60Short, className: semanticDotClasses.warning },
  { key: 'days_90_plus', label: REPORTS_MESSAGES.aging.buckets.days90PlusShort, className: semanticDotClasses.negative },
] as const

const getBucketPercent = (amount: ReportMoneyValue, total: ReportMoneyValue) => {
  const numericAmount = toReportNumber(amount)
  const numericTotal = toReportNumber(total)
  return numericTotal > 0 ? Math.max((numericAmount / numericTotal) * 100, numericAmount > 0 ? 3 : 0) : 0
}

export const AgingReportCards: React.FC<AgingReportCardsProps> = ({ items }) => {
  if (items.length === 0) {
    return <StateCard icon={Inbox} message={REPORTS_MESSAGES.aging.noOpenDebts} />
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {items.map((item) => (
        <ActionSurfaceLink variant="card" key={item.client_record_id} to={`/clients/${item.client_record_id}`}>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">{item.client_name}</p>
              <p className="text-xs text-gray-500">{REPORTS_MESSAGES.aging.clientNumber(item.client_record_id)}</p>
            </div>
            {toReportNumber(item.days_90_plus) > 0 && (
              <Badge variant="negative">{REPORTS_MESSAGES.aging.requiresAttention}</Badge>
            )}
          </div>

          <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatILS(item.total_outstanding)}</p>
          <p className="mt-0.5 text-xs text-gray-500">{REPORTS_MESSAGES.aging.totalOpenDebt}</p>

          <div className="mt-4 overflow-hidden rounded-full bg-gray-100">
            <div className="flex h-2 w-full">
              {BUCKETS.map((bucket) => (
                <div
                  key={bucket.key}
                  className={bucket.className}
                  style={{
                    width: `${getBucketPercent(item[bucket.key], item.total_outstanding)}%`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BUCKETS.map((bucket) => (
              <div key={bucket.key} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-500">{bucket.label}</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 tabular-nums">{formatILS(item[bucket.key])}</p>
              </div>
            ))}
          </div>

          {item.oldest_invoice_date && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-sm text-gray-500">
              <span>{REPORTS_MESSAGES.aging.debtSince(formatDate(item.oldest_invoice_date))}</span>
              {item.oldest_invoice_days != null && (
                <span className="font-medium text-gray-700 tabular-nums">
                  {REPORTS_MESSAGES.common.days(formatCount(item.oldest_invoice_days))}
                </span>
              )}
            </div>
          )}
        </ActionSurfaceLink>
      ))}
    </div>
  )
}

AgingReportCards.displayName = 'AgingReportCards'
