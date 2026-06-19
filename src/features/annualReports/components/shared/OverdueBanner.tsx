import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../../../../components/ui/primitives/Button'
import type { AnnualReportListItem } from '../../api'
import { cn, formatDate } from '../../../../utils/utils'
import { getClientReportName, getDaysOverdue } from '../../utils/sharedHelpers'
import { OVERDUE_PREVIEW_LIMIT } from '../../constants/sharedConstants'

interface OverdueBannerProps {
  overdue: AnnualReportListItem[]
  onSelect: (id: number) => void
}

export const OverdueBanner: React.FC<OverdueBannerProps> = ({ overdue, onSelect }) => {
  const [expanded, setExpanded] = useState(false)

  if (overdue.length === 0) return null

  const visible = expanded ? overdue : overdue.slice(0, OVERDUE_PREVIEW_LIMIT)
  const remaining = overdue.length - OVERDUE_PREVIEW_LIMIT
  const hasMore = remaining > 0

  return (
    <div
      className="rounded-xl border border-negative-200 bg-gradient-to-r from-negative-50 to-negative-100 shadow-sm"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="rounded-lg bg-negative-100 p-2 shrink-0">
          <AlertTriangle className="h-5 w-5 text-negative-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-negative-800">
            {overdue.length === 1 ? 'דוח אחד חרג ממועד ההגשה' : `${overdue.length} דוחות חרגו ממועד ההגשה`}
          </p>
          <p className="mt-0.5 text-xs text-negative-700">לחץ על שם הלקוח לפתיחת פרטי הדוח</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 p-1.5 text-negative-700 hover:bg-negative-100 hover:text-negative-700"
          aria-label={expanded ? 'כווץ רשימה' : 'הרחב רשימה'}
          aria-expanded={expanded}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Report list */}
      <div className="border-t border-negative-200/60 px-4 pb-3 pt-2 space-y-1.5">
        {visible.map((report) => {
          const days = getDaysOverdue(report.filing_deadline)
          return (
            <div
              key={report.id}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg px-3 py-2',
                'bg-white/60 hover:bg-white/90 transition-colors cursor-pointer',
              )}
              onClick={() => onSelect(report.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(report.id)}
            >
              <span className="text-sm font-medium text-gray-900 truncate">{getClientReportName(report)}</span>
              <div className="flex items-center gap-3 shrink-0 text-xs text-gray-500">
                <span className="tabular-nums">{formatDate(report.filing_deadline)}</span>
                {days !== null && <span className="font-semibold text-negative-600 tabular-nums">{days} ימים</span>}
              </div>
            </div>
          )
        })}

        {hasMore && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="w-full pt-1 text-xs font-medium text-negative-700 hover:text-negative-900 hover:bg-transparent"
            aria-expanded={expanded}
            aria-label={expanded ? 'הצג פחות דוחות' : `הצג ${remaining} דוחות נוספים שחרגו ממועד ההגשה`}
          >
            {expanded ? 'הצג פחות' : `+ עוד ${remaining} דוחות`}
          </Button>
        )}
      </div>
    </div>
  )
}

OverdueBanner.displayName = 'OverdueBanner'
