import type { LucideIcon } from 'lucide-react'
import { Briefcase, CheckCircle2, ClipboardList, ReceiptText, ShieldAlert, Table2, TriangleAlert, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, formatCurrencyILS, formatDate } from '@/utils/utils'
import { semanticDotClasses, semanticStatToneClasses } from '@/utils/semanticColors'
import type { AttentionBoardItem, AttentionUrgency } from '../../api/contracts'
import { ATTENTION_BOARD_COPY } from '../../constants'
import { dueDateLabel } from '../../utils/dashboardUtils'
import { DashboardPanel, DashboardSectionHeader } from '../shared/DashboardLayout'
import { Badge, type BadgeVariant } from '@/components/ui/primitives/Badge'
import { DASHBOARD_MESSAGES } from '../../messages'

interface UrgencyStyle {
  label: string
  dot: string
  iconBg: string
  badge: BadgeVariant
  delta: string
}

const URGENCY_CONFIG: Record<AttentionUrgency, UrgencyStyle> = {
  overdue: {
    label: DASHBOARD_MESSAGES.attention.overdue,
    dot: semanticDotClasses.negative,
    iconBg: semanticStatToneClasses.negative.iconBg,
    badge: 'negative',
    delta: 'text-negative-600',
  },
  approaching: {
    label: DASHBOARD_MESSAGES.attention.approaching,
    dot: semanticDotClasses.warning,
    iconBg: semanticStatToneClasses.warning.iconBg,
    badge: 'warning',
    delta: 'text-warning-600',
  },
  important: {
    label: DASHBOARD_MESSAGES.attention.important,
    dot: semanticDotClasses.info,
    iconBg: semanticStatToneClasses.info.iconBg,
    badge: 'info',
    delta: 'text-info-600',
  },
  upcoming: {
    label: DASHBOARD_MESSAGES.attention.upcoming,
    dot: 'bg-slate-300',
    iconBg: 'bg-slate-100 text-slate-500',
    badge: 'neutral',
    delta: 'text-slate-500',
  },
}

interface SourceConfig {
  icon: LucideIcon
  label: string
}

const SOURCE_CONFIG: Record<string, SourceConfig> = {
  vat_work_item: { icon: ClipboardList, label: DASHBOARD_MESSAGES.attention.vat },
  charge: { icon: ReceiptText, label: DASHBOARD_MESSAGES.attention.charge },
  advance_payment: { icon: Wallet, label: DASHBOARD_MESSAGES.attention.advancePayment },
  annual_report: { icon: Table2, label: DASHBOARD_MESSAGES.attention.annualReport },
  binder: { icon: Briefcase, label: DASHBOARD_MESSAGES.attention.binder },
  task: { icon: ClipboardList, label: DASHBOARD_MESSAGES.attention.task },
}

const DEFAULT_SOURCE: SourceConfig = { icon: TriangleAlert, label: DASHBOARD_MESSAGES.attention.general }

interface AttentionItemRowProps {
  item: AttentionBoardItem
}

const AttentionItemRow = ({ item }: AttentionItemRowProps) => {
  const urgency = URGENCY_CONFIG[item.urgency]
  const source = SOURCE_CONFIG[item.source_type] ?? DEFAULT_SOURCE
  const { icon: SourceIcon } = source

  return (
    <Link to={item.href} className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-slate-50">
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', urgency.iconBg)}>
        <SourceIcon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-900">{item.title}</span>
          <Badge variant={urgency.badge} size="2xs" dot={urgency.dot} className="shrink-0">
            {urgency.label}
          </Badge>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
          {item.client_name && <span className="font-medium text-slate-500 truncate max-w-[120px]">{item.client_name}</span>}
          {item.client_name && <span>·</span>}
          <span>{source.label}</span>
          {item.reason && (
            <>
              <span>·</span>
              <span className="truncate">{item.reason}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5 text-end">
        {item.amount && (
          <span className="text-sm font-bold tabular-nums text-primary-700">
            {formatCurrencyILS(item.amount, { maximumFractionDigits: 2 })}
          </span>
        )}
        {item.due_date && <span className="text-xs font-medium tabular-nums text-slate-500">{formatDate(item.due_date)}</span>}
        <span className={cn('text-2xs font-semibold tabular-nums', urgency.delta)}>{dueDateLabel(item.days_delta)}</span>
      </div>
    </Link>
  )
}

interface AttentionBoardProps {
  items: AttentionBoardItem[]
  total?: number
}

export const AttentionBoard = ({ items, total }: AttentionBoardProps) => {
  const isEmpty = items.length === 0
  const displayTotal = total ?? items.length

  return (
    <DashboardPanel>
      <div className="border-b border-slate-100 px-5 py-4">
        <DashboardSectionHeader
          icon={isEmpty ? undefined : ShieldAlert}
          title={ATTENTION_BOARD_COPY.title}
          subtitle={
            isEmpty
              ? ATTENTION_BOARD_COPY.subtitleEmpty
              : DASHBOARD_MESSAGES.attention.prioritySummary(displayTotal, items.length)
          }
          count={isEmpty ? undefined : items.length}
          tone={isEmpty ? 'neutral' : 'warning'}
          action={
            !isEmpty && displayTotal > items.length ? (
              <Link
                to="/work"
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-50"
              >
                {DASHBOARD_MESSAGES.attention.showAll}
              </Link>
            ) : undefined
          }
        />
      </div>

      {isEmpty ? (
        <div className="flex items-center gap-2 px-5 py-4 text-sm font-medium text-positive-600">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {ATTENTION_BOARD_COPY.empty}
        </div>
      ) : (
        <div className="max-h-[640px] overflow-y-auto px-2 py-2">
          {items.map((item) => (
            <AttentionItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </DashboardPanel>
  )
}

AttentionBoard.displayName = 'AttentionBoard'
