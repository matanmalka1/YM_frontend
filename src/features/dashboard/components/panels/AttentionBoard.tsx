import type { LucideIcon } from 'lucide-react'
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  ReceiptText,
  ShieldAlert,
  Table2,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, formatCurrencyILS, formatDate } from '@/utils/utils'
import type { AttentionBoardItem, AttentionUrgency } from '../../api/contracts'
import { ATTENTION_BOARD_COPY } from '../../constants'
import { dueDateLabel } from '../../utils/dashboardUtils'
import { DashboardPanel, DashboardSectionHeader } from '../shared/DashboardLayout'

type AttentionTone = 'neg' | 'warn' | 'info' | 'mut'

interface UrgencyConfig {
  tone: AttentionTone
  label: string
  dot: string
}

const URGENCY_CONFIG: Record<AttentionUrgency, UrgencyConfig> = {
  overdue: { tone: 'neg', label: 'באיחור', dot: 'bg-negative-500' },
  approaching: { tone: 'warn', label: 'מתקרב', dot: 'bg-warning-400' },
  important: { tone: 'info', label: 'חשוב', dot: 'bg-primary-500' },
  upcoming: { tone: 'mut', label: 'קרוב', dot: 'bg-slate-300' },
}

const TONE_ICON_CLASSES: Record<AttentionTone, string> = {
  neg: 'bg-negative-50 text-negative-500',
  warn: 'bg-warning-50 text-warning-600',
  info: 'bg-primary-50 text-primary-600',
  mut: 'bg-slate-100 text-slate-500',
}

const TONE_BADGE_CLASSES: Record<AttentionTone, string> = {
  neg: 'bg-negative-50 text-negative-700',
  warn: 'bg-warning-50 text-warning-700',
  info: 'bg-primary-50 text-primary-700',
  mut: 'bg-slate-100 text-slate-600',
}

const TONE_DELTA_CLASSES: Record<AttentionTone, string> = {
  neg: 'text-negative-600',
  warn: 'text-warning-600',
  info: 'text-primary-600',
  mut: 'text-slate-500',
}

interface SourceConfig {
  icon: LucideIcon
  label: string
}

const SOURCE_CONFIG: Record<string, SourceConfig> = {
  vat_work_item: { icon: ClipboardList, label: 'מע״מ' },
  charge: { icon: ReceiptText, label: 'חיוב' },
  advance_payment: { icon: Wallet, label: 'מקדמה' },
  annual_report: { icon: Table2, label: 'דוח שנתי' },
  binder: { icon: Briefcase, label: 'קלסר' },
  task: { icon: ClipboardList, label: 'משימה' },
}

const DEFAULT_SOURCE: SourceConfig = { icon: TriangleAlert, label: 'כללי' }

interface AttentionItemRowProps {
  item: AttentionBoardItem
}

const AttentionItemRow = ({ item }: AttentionItemRowProps) => {
  const urgency = URGENCY_CONFIG[item.urgency]
  const source = SOURCE_CONFIG[item.source_type] ?? DEFAULT_SOURCE
  const { icon: SourceIcon } = source
  const toneIcon = TONE_ICON_CLASSES[urgency.tone]
  const toneBadge = TONE_BADGE_CLASSES[urgency.tone]
  const toneDelta = TONE_DELTA_CLASSES[urgency.tone]

  return (
    <Link to={item.href} className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-slate-50">
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', toneIcon)}>
        <SourceIcon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-900">{item.title}</span>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-2xs font-semibold',
              toneBadge,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', urgency.dot)} />
            {urgency.label}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
          {item.client_name && (
            <span className="font-medium text-slate-500 truncate max-w-[120px]">{item.client_name}</span>
          )}
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
        {item.due_date && (
          <span className="text-xs font-medium tabular-nums text-slate-500">{formatDate(item.due_date)}</span>
        )}
        <span className={cn('text-2xs font-semibold tabular-nums', toneDelta)}>{dueDateLabel(item.days_delta)}</span>
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
              : `${displayTotal} פריטים פתוחים · ${items.length} בראש סדר העדיפויות`
          }
          count={isEmpty ? undefined : items.length}
          tone={isEmpty ? 'neutral' : 'amber'}
          action={
            !isEmpty && displayTotal > items.length ? (
              <Link
                to="/work"
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-50"
              >
                הצג הכל
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
