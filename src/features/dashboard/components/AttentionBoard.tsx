import { Link } from 'react-router-dom'
import { CheckCircle2, ShieldAlert } from 'lucide-react'
import { cn, formatCurrencyILS, formatDate } from '@/utils/utils'
import type { AttentionBoardItem } from '../api/contracts'
import { DashboardPanel, DashboardSectionHeader } from './DashboardPrimitives'

type Urgency = AttentionBoardItem['urgency']

const urgencyBadge: Record<Urgency, { label: string; cls: string }> = {
  overdue: { label: 'באיחור', cls: 'bg-negative-50 text-negative-600' },
  approaching: { label: 'דחוף', cls: 'bg-warning-50 text-warning-700' },
  important: { label: 'חשוב', cls: 'bg-primary-50 text-primary-700' },
  upcoming: { label: 'בקרוב', cls: 'bg-slate-100 text-slate-600' },
}

const dueDateLabel = (item: AttentionBoardItem): string => {
  const d = item.days_delta
  if (d < 0) return `באיחור ${Math.abs(d)} ימים`
  if (d === 0) return 'היום'
  return `עוד ${d} ימים`
}

interface AttentionItemRowProps {
  item: AttentionBoardItem
}

const AttentionItemRow = ({ item }: AttentionItemRowProps) => {
  const badge = urgencyBadge[item.urgency]

  const content = (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-3.5 transition-all hover:border-primary-100 hover:shadow-elevation-1">
      {/* Right: date */}
      <div className="w-24 shrink-0 text-right">
        {item.due_date && (
          <p className="text-xs font-semibold tabular-nums text-slate-700">{formatDate(item.due_date)}</p>
        )}
        <p
          className={cn(
            'mt-0.5 text-[11px] font-medium',
            item.urgency === 'overdue' ? 'text-negative-500' : 'text-slate-400',
          )}
        >
          {dueDateLabel(item)}
        </p>
      </div>

      {/* Center: title + meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
        <div className="mt-0.5 flex items-center gap-2 truncate">
          {item.client_name && <span className="truncate text-xs text-slate-400">{item.client_name}</span>}
          {item.reason && !item.client_name && (
            <span className="truncate text-xs text-slate-400">{item.reason}</span>
          )}
          {item.amount && (
            <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-700">
              {formatCurrencyILS(item.amount, { maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>

      {/* Left: badge */}
      <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold', badge.cls)}>{badge.label}</span>
    </div>
  )

  return <Link to={item.href}>{content}</Link>
}

interface AttentionBoardProps {
  items: AttentionBoardItem[]
}

export const AttentionBoard = ({ items }: AttentionBoardProps) => (
  <DashboardPanel>
    <div className="border-b border-slate-100 px-5 py-4">
      <DashboardSectionHeader
        icon={ShieldAlert}
        title="דרוש טיפול"
        subtitle={items.length === 0 ? 'הכל תקין — אין דברים דחופים לטיפול' : 'הדברים החשובים לטיפול עכשיו'}
        count={items.length}
        tone={items.length > 0 ? 'amber' : 'neutral'}
      />
    </div>

    {items.length === 0 ? (
      <div className="flex items-center gap-2 px-5 py-4 text-sm font-medium text-positive-600">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        הכל תקין — אין דברים דחופים לטיפול
      </div>
    ) : (
      <div className="max-h-[640px] space-y-2 overflow-y-auto p-4">
        {items.map((item) => (
          <AttentionItemRow key={item.id} item={item} />
        ))}
      </div>
    )}
  </DashboardPanel>
)

AttentionBoard.displayName = 'AttentionBoard'
