import type { TaxCalendarGroupsSummary } from '../api'

interface TaxCalendarSummaryStripProps {
  summary: TaxCalendarGroupsSummary
  linkedLabel: string
  showGroupsCount?: boolean
}

export const TaxCalendarSummaryStrip = ({
  summary,
  linkedLabel,
  showGroupsCount = false,
}: TaxCalendarSummaryStripProps) => {
  const items = [
    ...(showGroupsCount ? [{ label: 'סה״כ קבוצות', value: summary.groups, className: 'text-gray-900' }] : []),
    { label: linkedLabel, value: summary.linked, className: 'text-gray-900' },
    { label: 'פתוחים', value: summary.open, className: 'text-warning-700' },
    { label: 'באיחור', value: summary.overdue, className: 'text-negative-700' },
    { label: 'הושלמו', value: summary.done, className: 'text-positive-700' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="inline-flex items-baseline gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm"
        >
          <span className="text-xs font-medium text-gray-500">{item.label}</span>
          <span className={`font-mono font-semibold tabular-nums ${item.className}`}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}

TaxCalendarSummaryStrip.displayName = 'TaxCalendarSummaryStrip'
