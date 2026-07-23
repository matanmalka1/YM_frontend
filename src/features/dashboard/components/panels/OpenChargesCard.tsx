import { ArrowLeft, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, formatCount, formatShekelAmount } from '@/utils/utils'
import { Badge } from '@/components/ui/primitives/Badge'
import { Card } from '@/components/ui/primitives/Card'
import { DASHBOARD_HREFS } from '../../constants'
import { DASHBOARD_MESSAGES } from '../../messages'

interface OpenChargesCardProps {
  count: number
  amountIls: string | null
}

export const OpenChargesCard = ({ count, amountIls }: OpenChargesCardProps) => {
  const hasCharges = count > 0

  return (
    <Card variant="soft" size="compact">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1',
              hasCharges
                ? 'bg-warning-50 text-warning-600 ring-warning-100'
                : 'bg-positive-50 text-positive-600 ring-positive-100',
            )}
          >
            <ReceiptText className="h-5 w-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {DASHBOARD_MESSAGES.openCharges.title}
          </span>
        </div>
        {hasCharges && (
          <Badge variant="warning" size="2xs" className="shrink-0 font-bold tabular-nums">
            {formatCount(count)}
          </Badge>
        )}
      </div>

      <p className="font-bold tabular-nums text-xl leading-none text-slate-900">{amountIls ?? formatShekelAmount(0)}</p>
      <p className="mt-2 text-sm text-slate-500">{DASHBOARD_MESSAGES.openCharges.pendingCollection(formatCount(count))}</p>

      <Link
        to={DASHBOARD_HREFS.openCharges}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100"
      >
        <span>{DASHBOARD_MESSAGES.openCharges.openAll}</span>
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </Card>
  )
}

OpenChargesCard.displayName = 'OpenChargesCard'
