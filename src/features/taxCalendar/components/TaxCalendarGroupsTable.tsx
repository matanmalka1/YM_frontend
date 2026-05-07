import { Inbox } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { Card } from '@/components/ui/primitives/Card'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { TableSkeleton } from '@/components/ui/table/TableSkeleton'
import { cn, formatDate } from '@/utils/utils'
import { TAX_CALENDAR_OBLIGATION_LABELS, type TaxCalendarGroup } from '../api'

interface TaxCalendarGroupsTableProps {
  groups: TaxCalendarGroup[]
  isLoading?: boolean
}

const formatPeriodLabel = (group: TaxCalendarGroup): string => {
  if (group.obligation_type === 'annual_report') return String(group.tax_year)
  if (!group.period) return String(group.tax_year)
  return group.period_months_count ? `${group.period} (${group.period_months_count} חודשים)` : group.period
}

const formatEffectiveDueDate = (group: TaxCalendarGroup): string => {
  if (group.effective_due_date_min !== group.effective_due_date_max) {
    return `${formatDate(group.effective_due_date_min)} – ${formatDate(group.effective_due_date_max)}`
  }
  return formatDate(group.effective_due_date)
}

const countClassName = (count: number, tone: 'neutral' | 'success' | 'danger') =>
  cn(
    'font-mono text-sm font-semibold tabular-nums',
    tone === 'success' && count > 0 && 'text-positive-700',
    tone === 'danger' && count > 0 && 'text-negative-700',
    tone === 'neutral' && 'text-gray-900',
  )

export const TaxCalendarGroupsTable = ({ groups, isLoading = false }: TaxCalendarGroupsTableProps) => {
  if (isLoading) return <TableSkeleton rows={5} columns={8} />

  if (groups.length === 0) {
    return (
      <StateCard
        icon={Inbox}
        title="אין קבוצות להצגה"
        message="לא נמצאו קבוצות יומן מס התואמות לסינון הנוכחי"
        variant="illustration"
      />
    )
  }

  return (
    <Card className="overflow-hidden p-0" dir="rtl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500">סוג חובה</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500">תקופה / שנת מס</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500">מועד רגולטורי</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500">מועד אפקטיבי</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500">פתוחים</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500">הושלמו</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500">באיחור</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500">סה״כ מקושרים</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {groups.map((group) => (
              <tr key={group.tax_calendar_entry_id} className="hover:bg-primary-50/30">
                <td className="px-4 py-3">
                  <Badge variant="neutral">{TAX_CALENDAR_OBLIGATION_LABELS[group.obligation_type]}</Badge>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPeriodLabel(group)}</td>
                <td className="px-4 py-3 font-mono text-sm tabular-nums text-gray-700">
                  {formatDate(group.regulatory_due_date)}
                </td>
                <td className="px-4 py-3 font-mono text-sm tabular-nums text-gray-900">
                  {formatEffectiveDueDate(group)}
                </td>
                <td className="px-4 py-3">
                  <span className={countClassName(group.open_count, 'neutral')}>{group.open_count}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={countClassName(group.done_count, 'success')}>{group.done_count}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={countClassName(group.overdue_count, 'danger')}>{group.overdue_count}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={countClassName(group.linked_count, 'neutral')}>{group.linked_count}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

TaxCalendarGroupsTable.displayName = 'TaxCalendarGroupsTable'
