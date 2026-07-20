import { Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { Card } from '@/components/ui/primitives/Card'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import { StateCard } from '@/components/ui/feedback'
import { DefinitionList, type DefinitionItem } from '@/components/ui/layout/DefinitionList'
import type { AdvancePaymentRow } from '../../api/contracts'
import { formatShekelAmount, formatDate } from '@/utils/utils'
import { getAdvancePaymentMonthLabel } from '../../utils/advancePaymentComponentUtils'
import { ADVANCE_PAYMENT_STATUS_VARIANTS, getAdvancePaymentStatusLabel } from '../../constants'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface Props {
  rows: AdvancePaymentRow[]
  isLoading: boolean
  onRowClick: (row: AdvancePaymentRow) => void
}

const SkeletonCard = () => (
  <Card size="compact" className="h-full">
    <div className="space-y-4">
      <SkeletonBlock height="h-4" width="w-1/3" />
      <SkeletonBlock height="h-8" width="w-1/2" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} height="h-3" width="w-full" />
        ))}
      </div>
    </div>
  </Card>
)

export const ClientAdvancePaymentsCards: React.FC<Props> = ({ rows, isLoading, onRowClick }) => {
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
    return <StateCard icon={Wallet} message={ADVANCED_PAYMENTS_MESSAGES.clientCards.empty} size="compact" />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {rows.map((row) => {
        const expected = Number(row.expected_amount ?? 0)
        const paid = Number(row.paid_amount ?? 0)
        const balance = Math.max(expected - paid, 0)
        // The turnover row states what the payment holds; an available-but-
        // unsnapshotted VAT figure gets its own line below it, never this value.
        const turnoverLabel =
          row.turnover_amount != null && row.turnover_source != null
            ? ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.turnoverLabel(row.turnover_source)
            : ADVANCED_PAYMENTS_MESSAGES.clientCards.missingTurnoverLabel
        const isPaid = row.status === 'paid'

        const detailItems: DefinitionItem[] = [
          {
            label: ADVANCED_PAYMENTS_MESSAGES.clientCards.dueDateLabel,
            value: formatDate(row.due_date_effective ?? row.due_date),
          },
          ...(row.paid_at
            ? [{ label: ADVANCED_PAYMENTS_MESSAGES.clientCards.paidAtLabel, value: formatDate(row.paid_at) }]
            : []),
          { label: ADVANCED_PAYMENTS_MESSAGES.clientCards.paidLabel, value: formatShekelAmount(paid) },
          {
            label: ADVANCED_PAYMENTS_MESSAGES.clientCards.balanceLabel,
            value: (
              <span className={balance > 0 ? 'text-negative-600' : 'text-positive-600'}>
                {formatShekelAmount(balance)}
              </span>
            ),
          },
          {
            label: turnoverLabel,
            value: (
              <span className={row.turnover_amount == null ? 'text-negative-600' : undefined}>
                {row.turnover_amount != null ? formatShekelAmount(Number(row.turnover_amount)) : '—'}
              </span>
            ),
            fullWidth: true,
          },
          ...(row.turnover_amount == null && row.available_turnover != null
            ? [
                {
                  label: ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.availableBadge,
                  value: (
                    <span className="text-info-700">
                      {ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.available(
                        row.available_turnover.source,
                        formatShekelAmount(Number(row.available_turnover.amount)),
                      )}
                    </span>
                  ),
                  fullWidth: true,
                },
              ]
            : []),
        ]

        return (
          <Card key={row.id} size="compact" className="h-full">
            <div className="flex h-full flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {getAdvancePaymentMonthLabel(row.period, row.period_months_count)}
                </span>
                <div className="flex flex-wrap items-center justify-end gap-1">
                  <StatusBadge
                    status={row.status}
                    getLabel={getAdvancePaymentStatusLabel}
                    variantMap={ADVANCE_PAYMENT_STATUS_VARIANTS}
                  />
                  {row.paid_late ? (
                    <Badge variant="warning">{ADVANCED_PAYMENTS_MESSAGES.clientCards.paidLate}</Badge>
                  ) : row.timing_status === 'overdue' ? (
                    <Badge variant="negative">{ADVANCED_PAYMENTS_MESSAGES.clientCards.overdue}</Badge>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-0.5">
                  {ADVANCED_PAYMENTS_MESSAGES.clientCards.expectedLabel}
                </div>
                <div className="text-2xl font-bold text-positive-700">{formatShekelAmount(expected)}</div>
              </div>

              <DefinitionList
                items={detailItems}
                columns={2}
                className="gap-x-4 gap-y-2"
                valueClassName="text-gray-800"
              />

              <Button
                variant={isPaid ? 'outline' : 'primary'}
                fullWidth
                onClick={() => onRowClick(row)}
                className="mt-auto"
              >
                {isPaid
                  ? ADVANCED_PAYMENTS_MESSAGES.clientCards.viewDetails
                  : ADVANCED_PAYMENTS_MESSAGES.clientCards.updatePayment}
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
