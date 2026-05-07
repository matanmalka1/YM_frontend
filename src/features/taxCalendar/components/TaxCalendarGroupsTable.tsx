import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Inbox } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { Card } from '@/components/ui/primitives/Card'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { TableSkeleton } from '@/components/ui/table/TableSkeleton'
import { cn, formatDate, formatPlainIdentifier, getErrorMessage } from '@/utils/utils'
import { getTaxDeadlinePeriodLabel } from '@/features/taxDeadlines'
import { useTaxCalendarGroupItems } from '../hooks/useTaxCalendarGroupItems'
import {
  TAX_CALENDAR_OBLIGATION_LABELS,
  type TaxCalendarGroup,
  type TaxCalendarGroupItem,
  type TaxCalendarGroupItemSourceType,
} from '../api'

interface TaxCalendarGroupsTableProps {
  groups: TaxCalendarGroup[]
  isLoading?: boolean
}

const formatPeriodLabel = (group: TaxCalendarGroup): string => {
  const label = getTaxDeadlinePeriodLabel({
    deadline_type: group.obligation_type,
    period: group.period,
    period_months_count: group.period_months_count as 1 | 2 | null,
    tax_year: group.tax_year,
  })

  if (label !== 'ללא תקופה') return label
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

const SOURCE_TYPE_LABELS: Record<TaxCalendarGroupItemSourceType, string> = {
  vat_work_item: 'דוח מע״מ',
  advance_payment: 'מקדמה',
  annual_report: 'דוח שנתי',
}

const getItemPath = (item: TaxCalendarGroupItem): string => {
  if (item.source_type === 'vat_work_item') return `/tax/vat/${item.source_id}`
  if (item.source_type === 'annual_report') return `/tax/reports/${item.source_id}`
  return `/tax/advance-payments?focus=${item.source_id}`
}

const formatItemPeriodLabel = (item: TaxCalendarGroupItem): string =>
  getTaxDeadlinePeriodLabel({
    deadline_type: item.source_type === 'annual_report' ? 'annual_report' : item.source_type,
    period: item.period,
    period_months_count: item.period_months_count as 1 | 2 | null,
    tax_year: item.tax_year,
  })

const getStateLabel = (item: TaxCalendarGroupItem): string => {
  if (item.done) return 'הושלם'
  if (item.overdue) return 'באיחור'
  return 'פתוח'
}

const getStateVariant = (item: TaxCalendarGroupItem): 'success' | 'warning' | 'error' => {
  if (item.done) return 'success'
  if (item.overdue) return 'error'
  return 'warning'
}

const GroupItemsRows = ({ group, isOpen }: { group: TaxCalendarGroup; isOpen: boolean }) => {
  const { data, isPending, isError, error } = useTaxCalendarGroupItems(group.tax_calendar_entry_id, isOpen)
  const items = data?.items ?? []

  if (isPending) {
    return (
      <tr>
        <td colSpan={8} className="bg-gray-50 px-4 py-4 text-center text-sm text-gray-500">
          טוען רשומות מקושרות...
        </td>
      </tr>
    )
  }

  if (isError) {
    return (
      <tr>
        <td colSpan={8} className="bg-negative-50 px-4 py-4 text-sm text-negative-700">
          {getErrorMessage(error, 'שגיאה בטעינת רשומות מקושרות')}
        </td>
      </tr>
    )
  }

  if (items.length === 0) {
    return (
      <tr>
        <td colSpan={8} className="bg-gray-50 px-4 py-4 text-center text-sm text-gray-500">
          אין רשומות מקושרות לקבוצה זו
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td colSpan={8} className="bg-gray-50 p-0">
        <div className="overflow-x-auto border-t border-gray-100">
          <table className="w-full border-collapse text-right text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-100/80">
                <th className="px-4 py-2 text-xs font-semibold text-gray-500">לקוח</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500">מס׳ לקוח</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500">סוג רשומה</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500">תקופה / שנת מס</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500">סטטוס</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500">מועד רגולטורי</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500">מועד אפקטיבי</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500">מצב</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {items.map((item) => (
                <tr key={`${item.source_type}-${item.source_id}`} className="hover:bg-primary-50/30">
                  <td className="px-4 py-2">
                    <Link className="font-medium text-primary-700 hover:text-primary-900" to={getItemPath(item)}>
                      {item.client_name ?? `לקוח #${item.client_record_id}`}
                    </Link>
                  </td>
                  <td className="px-4 py-2 font-mono tabular-nums text-gray-700">
                    {formatPlainIdentifier(item.office_client_number)}
                  </td>
                  <td className="px-4 py-2">{SOURCE_TYPE_LABELS[item.source_type]}</td>
                  <td className="px-4 py-2">{formatItemPeriodLabel(item)}</td>
                  <td className="px-4 py-2">{item.status}</td>
                  <td className="px-4 py-2 font-mono tabular-nums">{formatDate(item.regulatory_due_date)}</td>
                  <td className="px-4 py-2 font-mono tabular-nums">{formatDate(item.effective_due_date)}</td>
                  <td className="px-4 py-2">
                    <Badge variant={getStateVariant(item)}>{getStateLabel(item)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  )
}

export const TaxCalendarGroupsTable = ({ groups, isLoading = false }: TaxCalendarGroupsTableProps) => {
  const [openEntryId, setOpenEntryId] = useState<number | null>(null)

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
            {groups.map((group) => {
              const isOpen = openEntryId === group.tax_calendar_entry_id
              return (
                <Fragment key={group.tax_calendar_entry_id}>
                  <tr
                    className="cursor-pointer hover:bg-primary-50/30"
                    onClick={() => setOpenEntryId(isOpen ? null : group.tax_calendar_entry_id)}
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <ChevronDown
                          className={cn('h-4 w-4 text-gray-500 transition-transform', !isOpen && '-rotate-90')}
                        />
                        <Badge variant="neutral">{TAX_CALENDAR_OBLIGATION_LABELS[group.obligation_type]}</Badge>
                      </span>
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
                  {isOpen && <GroupItemsRows group={group} isOpen={isOpen} />}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

TaxCalendarGroupsTable.displayName = 'TaxCalendarGroupsTable'
