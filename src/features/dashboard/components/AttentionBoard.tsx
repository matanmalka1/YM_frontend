import { Link } from 'react-router-dom'
import { CheckCircle2, ShieldAlert } from 'lucide-react'
import { cn, formatDate } from '@/utils/utils'
import type { AttentionBoardItem } from '../api/contracts'
import { DashboardPanel, DashboardSectionHeader } from './DashboardPrimitives'

type Urgency = AttentionBoardItem['urgency']

const urgencyBadge: Record<Urgency, { label: string; cls: string }> = {
  overdue: { label: 'באיחור', cls: 'bg-red-100 text-red-700 ring-1 ring-red-200' },
  approaching: { label: 'דחוף', cls: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200' },
  important: { label: 'חשוב', cls: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' },
  upcoming: { label: 'בקרוב', cls: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' },
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
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-4 transition-all hover:border-blue-200 hover:shadow-sm">
      {/* Right: date */}
      <div className="w-24 shrink-0 text-right">
        {item.due_date && (
          <p className="text-xs font-semibold tabular-nums text-gray-700">{formatDate(item.due_date)}</p>
        )}
        <p
          className={cn(
            'mt-0.5 text-[11px] font-medium',
            item.urgency === 'overdue' ? 'text-red-600' : 'text-gray-500',
          )}
        >
          {dueDateLabel(item)}
        </p>
      </div>

      {/* Center: title + meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{item.title}</p>
        <div className="mt-0.5 flex items-center gap-2 truncate">
          {item.client_name && (
            <span className="truncate text-xs text-gray-500">{item.client_name}</span>
          )}
          {item.reason && !item.client_name && (
            <span className="truncate text-xs text-gray-500">{item.reason}</span>
          )}
          {item.amount && (
            <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-700">{item.amount}</span>
          )}
        </div>
      </div>

      {/* Left: badge */}
      <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold', badge.cls)}>
        {badge.label}
      </span>
    </div>
  )

  return <Link to={item.href}>{content}</Link>
}

interface AttentionBoardProps {
  items: AttentionBoardItem[]
}

export const AttentionBoard = ({ items }: AttentionBoardProps) => (
  <DashboardPanel>
    <div className="border-b border-gray-100 px-5 py-4">
      <DashboardSectionHeader
        icon={ShieldAlert}
        title="לוח תשומת לב"
        subtitle={items.length === 0 ? 'הכל תקין — אין דברים דחופים לטיפול' : 'הדברים החשובים לטיפול עכשיו'}
        count={items.length}
        tone={items.length > 0 ? 'amber' : 'neutral'}
      />
    </div>

    {items.length === 0 ? (
      <div className="flex items-center gap-2 px-5 py-4 text-sm font-medium text-green-700">
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
