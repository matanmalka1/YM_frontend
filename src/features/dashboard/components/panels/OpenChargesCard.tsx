import { ArrowLeft, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/utils'
import { DASHBOARD_HREFS } from '../../dashboardConstants'

interface OpenChargesCardProps {
  count: number
  amountIls: string | null
}

export const OpenChargesCard = ({ count, amountIls }: OpenChargesCardProps) => {
  const hasCharges = count > 0

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-elevation-1">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">חיובים פתוחים</span>
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-xl',
            hasCharges ? 'bg-warning-50 text-warning-600' : 'bg-positive-50 text-positive-600',
          )}
        >
          <ReceiptText className="h-4 w-4" />
        </span>
      </div>

      <p className="font-bold tabular-nums text-3xl leading-none text-slate-900">
        {amountIls ?? '₪ 0'}
      </p>
      <p className="mt-2 text-sm text-slate-500">
        <span className="font-bold tabular-nums text-slate-700">{count.toLocaleString('he-IL')}</span>
        {' '}חיובים ממתינים לגבייה
      </p>

      <Link
        to={DASHBOARD_HREFS.openCharges}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100"
      >
        <span>פתח את כל החיובים</span>
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </div>
  )
}

OpenChargesCard.displayName = 'OpenChargesCard'
