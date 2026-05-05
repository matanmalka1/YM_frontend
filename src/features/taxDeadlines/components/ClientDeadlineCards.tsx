import { CalendarClock, FileText, Receipt, TrendingUp } from 'lucide-react'
import { cn, formatDate } from '../../../utils/utils'
import { calculateDaysRemaining, getDeadlineTypeLabel } from '../api'
import { DeadlineStatusBadge } from './TaxDeadlineTableParts'
import { TaxDeadlineRowActions } from './TaxDeadlineRowActions'
import { getTaxDeadlinePeriodLabel, getDeadlineDaysLabelShort, groupTaxDeadlinesByMonth } from '../utils'
import type { ClientDeadlineFilters } from '../hooks/useClientTaxDeadlines'
import type { TaxDeadlineResponse, DeadlineUrgencyLevel } from '../api'

interface ClientDeadlineCardsProps {
  deadlines: TaxDeadlineResponse[]
  isLoading?: boolean
  filters?: ClientDeadlineFilters
  onResetFilters?: () => void
  completingId: number | null
  reopeningId?: number | null
  deletingId?: number | null
  onComplete?: (id: number) => void
  onReopen?: (id: number) => void
  onEdit?: (deadline: TaxDeadlineResponse) => void
  onDelete?: (id: number) => void
  onRowClick?: (deadline: TaxDeadlineResponse) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type SourceSeverity = 'success' | 'warning'

const getSourceState = (deadline: TaxDeadlineResponse): { label: string; severity: SourceSeverity } => {
  if (deadline.deadline_type === 'vat') {
    return deadline.vat_work_item_id != null
      ? { label: 'דוח מע״מ קיים', severity: 'success' }
      : { label: 'אין דוח מע״מ מקושר', severity: 'warning' }
  }
  if (deadline.deadline_type === 'advance_payment') {
    return deadline.advance_payment_id != null
      ? { label: 'מקדמה קיימת', severity: 'success' }
      : { label: 'אין מקדמה מקושרת', severity: 'warning' }
  }
  if (deadline.deadline_type === 'annual_report') {
    return { label: 'דוח שנתי', severity: 'success' }
  }
  return { label: 'אין מקור מקושר', severity: 'warning' }
}

const TYPE_ICON: Record<string, React.ElementType> = {
  vat: Receipt,
  advance_payment: TrendingUp,
  annual_report: FileText,
}

const TYPE_ICON_BG: Record<string, string> = {
  vat: 'bg-blue-50 text-blue-500',
  advance_payment: 'bg-violet-50 text-violet-500',
  annual_report: 'bg-amber-50 text-amber-500',
}

const ACCENT: Partial<Record<DeadlineUrgencyLevel | 'completed' | 'canceled', string>> = {
  overdue: 'border-r-[3px] border-r-negative-500',
  critical: 'border-r-[3px] border-r-negative-400',
  warning: 'border-r-[3px] border-r-warning-400',
  completed: 'border-r-[3px] border-r-positive-400',
  canceled: 'border-r-[3px] border-r-gray-200',
}

const URGENCY_TEXT: Record<DeadlineUrgencyLevel, string> = {
  overdue: 'text-negative-600',
  critical: 'text-negative-500',
  warning: 'text-warning-600',
  normal: 'text-gray-400',
  none: 'text-gray-400',
}

const getAccent = (deadline: TaxDeadlineResponse): string => {
  if (deadline.status === 'canceled') return ACCENT.canceled ?? ''
  if (deadline.status === 'completed') return ACCENT.completed ?? ''
  return ACCENT[deadline.urgency_level] ?? ''
}

// ── Deadline row ──────────────────────────────────────────────────────────────

const DeadlineRow = ({
  deadline,
  completingId,
  reopeningId,
  deletingId,
  onComplete,
  onReopen,
  onEdit,
  onDelete,
  onRowClick,
}: { deadline: TaxDeadlineResponse } & Omit<ClientDeadlineCardsProps, 'deadlines' | 'isLoading'>) => {
  const isPending = deadline.status === 'pending'
  const daysRemaining = calculateDaysRemaining(deadline.due_date)
  const urgencyText =
    isPending && deadline.urgency_level !== 'none' ? getDeadlineDaysLabelShort(daysRemaining, false) : null
  const { label: sourceLabel, severity: sourceSeverity } = getSourceState(deadline)
  const Icon = TYPE_ICON[deadline.deadline_type] ?? CalendarClock
  const iconBg = TYPE_ICON_BG[deadline.deadline_type] ?? 'bg-gray-100 text-gray-400'

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5',
        'cursor-pointer transition-colors duration-100 hover:border-gray-300 hover:bg-gray-50/50',
        getAccent(deadline),
        deadline.status === 'canceled' && 'opacity-60',
      )}
      onClick={() => onRowClick?.(deadline)}
    >
      {/* Type icon */}
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        <Icon className="h-3.5 w-3.5" />
      </div>

      {/* Content: title row + detail row */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* Line 1: type · period */}
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="shrink-0 text-[11px] text-gray-400">{getDeadlineTypeLabel(deadline.deadline_type)}</span>
          <span className="text-gray-300 text-[11px]">·</span>
          <span className="truncate text-sm font-semibold text-gray-800">{getTaxDeadlinePeriodLabel(deadline)}</span>
        </div>
        {/* Line 2: due date · days · source */}
        <div className="flex items-center gap-1 min-w-0 flex-wrap">
          <span className="text-xs font-medium tabular-nums text-gray-600">{formatDate(deadline.due_date)}</span>
          {urgencyText && (
            <>
              <span className="text-gray-300 text-[11px]">·</span>
              <span className={cn('text-xs font-medium', URGENCY_TEXT[deadline.urgency_level])}>{urgencyText}</span>
            </>
          )}
          <span className="text-gray-200 text-[11px]">·</span>
          <span
            className={cn(
              'h-1.5 w-1.5 shrink-0 rounded-full',
              sourceSeverity === 'success' ? 'bg-positive-500' : 'bg-amber-400',
            )}
          />
          <span
            className={cn(
              'truncate text-[11px]',
              sourceSeverity === 'warning' ? 'font-medium text-amber-600' : 'text-gray-400',
            )}
          >
            {sourceLabel}
          </span>
        </div>
      </div>

      {/* Left: status + actions */}
      <div className="flex shrink-0 flex-col items-end gap-1" onClick={(e) => e.stopPropagation()}>
        <DeadlineStatusBadge status={deadline.status} />
        <TaxDeadlineRowActions
          deadline={deadline}
          completingId={completingId}
          reopeningId={reopeningId}
          deletingId={deletingId}
          onComplete={onComplete}
          onReopen={onReopen}
          onEdit={onEdit}
          onDelete={onDelete}
          clientScoped
        />
      </div>
    </div>
  )
}

// ── Side panel ────────────────────────────────────────────────────────────────

const STATUS_ROWS: Array<{
  label: string
  key: 'total' | 'pending' | 'completed' | 'overdue' | 'canceled'
  dot: string
  valueClass: string
}> = [
  { key: 'total', label: 'סה״כ', dot: 'bg-gray-400', valueClass: 'text-gray-700' },
  { key: 'pending', label: 'ממתינים', dot: 'bg-warning-400', valueClass: 'text-gray-700' },
  { key: 'completed', label: 'הושלמו', dot: 'bg-positive-500', valueClass: 'text-positive-600' },
  { key: 'overdue', label: 'באיחור', dot: 'bg-negative-500', valueClass: 'text-negative-600' },
  { key: 'canceled', label: 'בוטלו', dot: 'bg-gray-300', valueClass: 'text-gray-400' },
]

const SidePanel = ({
  deadlines,
  onRowClick,
}: {
  deadlines: TaxDeadlineResponse[]
  onRowClick?: (deadline: TaxDeadlineResponse) => void
}) => {
  const counts = {
    total: deadlines.length,
    pending: deadlines.filter((d) => d.status === 'pending').length,
    completed: deadlines.filter((d) => d.status === 'completed').length,
    overdue: deadlines.filter((d) => d.urgency_level === 'overdue' && d.status === 'pending').length,
    canceled: deadlines.filter((d) => d.status === 'canceled').length,
  }

  const upcoming = [...deadlines]
    .filter((d) => d.status === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-3">
      {/* Status summary */}
      <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-3">
        <p className="mb-1.5 text-xs font-semibold text-gray-500">סטטוס מועדים</p>
        <div className="divide-y divide-gray-100">
          {STATUS_ROWS.map(({ key, label, dot, valueClass }) => (
            <div key={key} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dot)} />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
              <span className={cn('text-sm font-semibold tabular-nums', valueClass)}>{counts[key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-3">
          <p className="mb-1.5 text-xs font-semibold text-gray-500">בקרוב</p>
          <div className="divide-y divide-gray-100">
            {upcoming.map((d) => {
              const days = calculateDaysRemaining(d.due_date)
              const daysLabel = getDeadlineDaysLabelShort(days, false)
              return (
                <div
                  key={d.id}
                  className={cn('py-2', onRowClick && 'cursor-pointer rounded transition-colors hover:bg-gray-50/60')}
                  onClick={() => onRowClick?.(d)}
                >
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="truncate text-xs font-semibold text-gray-800">{getTaxDeadlinePeriodLabel(d)}</span>
                    <span className="shrink-0 text-[11px] text-gray-400">{getDeadlineTypeLabel(d.deadline_type)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-1">
                    <span className="text-[11px] tabular-nums text-gray-500">{formatDate(d.due_date)}</span>
                    <span className={cn('text-[11px] font-medium', URGENCY_TEXT[d.urgency_level])}>{daysLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

const hasActiveFilters = (filters?: ClientDeadlineFilters) => Boolean(filters?.deadline_type || filters?.status)

export const ClientDeadlineCards = ({
  deadlines,
  isLoading,
  filters,
  onResetFilters,
  completingId,
  reopeningId,
  deletingId,
  onComplete,
  onReopen,
  onEdit,
  onDelete,
  onRowClick,
}: ClientDeadlineCardsProps) => {
  const filtersActive = hasActiveFilters(filters)

  const emptyState = filtersActive ? (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <CalendarClock className="h-8 w-8 text-gray-300" />
      <div>
        <p className="text-sm font-medium text-gray-600">אין מועדים התואמים לסינון</p>
        <p className="mt-0.5 text-xs text-gray-400">אפשר לשנות או לנקות את הסינון כדי לראות מועדים נוספים</p>
      </div>
      {onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          נקה סינון
        </button>
      )}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <CalendarClock className="h-8 w-8 text-gray-300" />
      <p className="text-sm font-medium text-gray-500">אין מועדים להצגה</p>
      <p className="text-xs text-gray-400">לא נמצאו מועדי מס ללקוח הזה</p>
    </div>
  )

  const mainList = isLoading ? (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  ) : deadlines.length === 0 ? (
    emptyState
  ) : (
    <div className="space-y-4">
      {groupTaxDeadlinesByMonth(deadlines).map((group) => (
        <div key={group.key}>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">{group.label}</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="space-y-2">
            {group.items.map((deadline) => (
              <DeadlineRow
                key={deadline.id}
                deadline={deadline}
                completingId={completingId}
                reopeningId={reopeningId}
                deletingId={deletingId}
                onComplete={onComplete}
                onReopen={onReopen}
                onEdit={onEdit}
                onDelete={onDelete}
                onRowClick={onRowClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
      <div>{mainList}</div>
      {!isLoading && (
        <div className="xl:sticky xl:top-4 xl:self-start">
          <SidePanel deadlines={deadlines} onRowClick={onRowClick} />
        </div>
      )}
    </div>
  )
}

ClientDeadlineCards.displayName = 'ClientDeadlineCards'
