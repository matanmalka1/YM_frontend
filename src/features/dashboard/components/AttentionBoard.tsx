import { Link } from 'react-router-dom'
import { CheckCircle2, ShieldAlert } from 'lucide-react'
import { cn, formatCurrencyILS, formatDate } from '@/utils/utils'
import { makeLabelGetter } from '@/utils/labels'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import type { AttentionBoardItem } from '../api/contracts'
import { ATTENTION_BOARD_COPY, ATTENTION_URGENCY_LABELS, ATTENTION_URGENCY_VARIANTS } from '../dashboardConstants'
import { dueDateLabel } from '../dashboard.utils'
import { DashboardPanel, DashboardSectionHeader } from './DashboardPrimitives'

const getAttentionUrgencyLabel = makeLabelGetter(ATTENTION_URGENCY_LABELS)

interface AttentionItemRowProps {
  item: AttentionBoardItem
}

const AttentionItemRow = ({ item }: AttentionItemRowProps) => {
  return (
    <Link
      to={item.href}
      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-3.5 transition-all hover:border-primary-100 hover:shadow-elevation-1"
    >
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
          {dueDateLabel(item.days_delta)}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
        <div className="mt-0.5 flex items-center gap-2 truncate">
          {item.client_name && <span className="truncate text-xs text-slate-400">{item.client_name}</span>}
          {item.reason && !item.client_name && <span className="truncate text-xs text-slate-400">{item.reason}</span>}
          {item.amount && (
            <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-700">
              {formatCurrencyILS(item.amount, { maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>

      <StatusBadge
        status={item.urgency}
        getLabel={getAttentionUrgencyLabel}
        variantMap={ATTENTION_URGENCY_VARIANTS}
        size="xs"
        className="shrink-0"
      />
    </Link>
  )
}

interface AttentionBoardProps {
  items: AttentionBoardItem[]
}

export const AttentionBoard = ({ items }: AttentionBoardProps) => {
  const isEmpty = items.length === 0

  return (
    <DashboardPanel>
      <div className="border-b border-slate-100 px-5 py-4">
        <DashboardSectionHeader
          icon={ShieldAlert}
          title={ATTENTION_BOARD_COPY.title}
          subtitle={isEmpty ? ATTENTION_BOARD_COPY.subtitleEmpty : ATTENTION_BOARD_COPY.subtitleActive}
          count={items.length}
          tone={isEmpty ? 'neutral' : 'amber'}
        />
      </div>

      {isEmpty ? (
        <div className="flex items-center gap-2 px-5 py-4 text-sm font-medium text-positive-600">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {ATTENTION_BOARD_COPY.empty}
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
}

AttentionBoard.displayName = 'AttentionBoard'
