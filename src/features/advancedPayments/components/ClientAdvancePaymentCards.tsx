import type { AdvancePaymentRow } from '../types'
import { formatShekelAmount } from '@/utils/utils'
import { getAdvancePaymentMonthLabel } from './advancePaymentComponent.utils'
import { formatDate, cn } from '../../../utils/utils'
import { AdvancePaymentStatusBadge } from './AdvancePaymentStatusBadge'
import { AdvancePaymentTimingBadge } from './AdvancePaymentTimingBadge'

interface Props {
  rows: AdvancePaymentRow[]
  isLoading: boolean
  onRowClick: (row: AdvancePaymentRow) => void
}

const SkeletonCard = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3" />
    <div className="h-8 bg-gray-200 rounded w-1/2 mt-1" />
    <div className="grid grid-cols-2 gap-2 mt-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-100 rounded" />
      ))}
    </div>
  </div>
)

export const ClientAdvancePaymentCards: React.FC<Props> = ({ rows, isLoading, onRowClick }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return <div className="flex items-center justify-center py-16 text-gray-400 text-sm">אין מקדמות להצגה</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" dir="rtl">
      {rows.map((row) => {
        const expected = Number(row.expected_amount ?? 0)
        const paid = Number(row.paid_amount ?? 0)
        const balance = Math.max(expected - paid, 0)
        const turnover = row.turnover_amount ?? row.live_turnover
        const hasTurnover = turnover !== null && turnover !== undefined
        const turnoverSource = row.turnover_amount ? 'מחזור מוזן' : row.live_turnover ? 'נגזר ממע״מ' : 'חסר'
        const turnoverLabel = row.missing_turnover ? 'חסר מחזור' : `מחזור (${turnoverSource})`
        const isPaid = row.status === 'paid'
        const ctaText = isPaid ? 'צפה בפרטים' : 'עדכן תשלום'

        return (
          <button
            type="button"
            key={row.id}
            onClick={() => onRowClick(row)}
            className={cn(
              'text-right w-full rounded-xl border bg-white p-4 shadow-sm space-y-3',
              'hover:shadow-md hover:border-primary-300 transition-all duration-150 cursor-pointer',
              isPaid ? 'border-success-200' : 'border-gray-200',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {getAdvancePaymentMonthLabel(row.period, row.period_months_count)}
              </span>
              <div className="flex items-center gap-1 flex-wrap justify-end">
                <AdvancePaymentStatusBadge status={row.status} />
                <AdvancePaymentTimingBadge timingStatus={row.timing_status} paidLate={row.paid_late} />
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-0.5">צפוי לתשלום</div>
              <div className="text-2xl font-bold text-success-700">{formatShekelAmount(expected)}</div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <div className="text-xs text-gray-400">לתשלום עד</div>
                <div className="font-bold text-gray-900">{formatDate(row.due_date)}</div>
              </div>
              {row.paid_at && (
                <div>
                  <div className="text-gray-400 mb-0.5">שולם ב</div>
                  <div className="font-medium text-gray-800">{formatDate(row.paid_at)}</div>
                </div>
              )}
              <div>
                <div className="text-gray-400 mb-0.5">שולם</div>
                <div className="font-medium text-gray-800">{formatShekelAmount(paid)}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-0.5">יתרה</div>
                <div className={cn('font-medium', balance > 0 ? 'text-error-600' : 'text-success-600')}>
                  {formatShekelAmount(balance)}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-400 mb-0.5">{turnoverLabel}</div>
                <div className={cn('font-medium', row.missing_turnover ? 'text-error-600' : 'text-gray-800')}>
                  {hasTurnover ? formatShekelAmount(Number(turnover)) : '—'}
                </div>
              </div>
            </div>

            <div className="mt-4 flex h-9 items-center justify-center rounded-lg border border-primary-200 bg-primary-50 text-sm font-bold text-primary-700">
              {ctaText}
            </div>
          </button>
        )
      })}
    </div>
  )
}

ClientAdvancePaymentCards.displayName = 'ClientAdvancePaymentCards'
