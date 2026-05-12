import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { TableSkeleton } from '@/components/ui/table/TableSkeleton'
import { GroupedPeriodRow, type PeriodSummaryMetric } from '@/components/ui/table/GroupedPeriodRow'
import { formatRelativeDueLabel } from '@/components/ui/table/groupedPeriodRow.utils'
import { cn, formatDate, formatPlainIdentifier, getErrorMessage } from '@/utils/utils'
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
  clientSearchText?: string
  clientRecordId?: number
}

const MONTH_LABELS = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
]

const formatPeriodValue = (period: string | null, monthsCount: number | null, taxYear: number | null): string => {
  if (!period) return taxYear != null ? `${taxYear}` : 'ללא תקופה'

  const match = /^(\d{4})-(\d{2})$/.exec(period)
  if (!match) return monthsCount ? `${period} (${monthsCount} חודשים)` : period

  const year = Number(match[1])
  const month = Number(match[2])
  const monthLabel = MONTH_LABELS[month - 1] ?? period
  if (monthsCount === 2) {
    const nextMonthLabel = MONTH_LABELS[month] ?? MONTH_LABELS[month - 1] ?? period
    return `${monthLabel}–${nextMonthLabel} ${year}`
  }
  return `${monthLabel} ${year}`
}

const formatGroupTitle = (group: TaxCalendarGroup): string => {
  const obligationLabel = TAX_CALENDAR_OBLIGATION_LABELS[group.obligation_type]
  const periodLabel = formatPeriodValue(group.period, group.period_months_count, group.tax_year)
  return `${obligationLabel} · ${periodLabel}`
}

const formatEffectiveDueDateRange = (group: TaxCalendarGroup): string => {
  if (group.effective_due_date_min !== group.effective_due_date_max) {
    return `${formatDate(group.effective_due_date_min)}–${formatDate(group.effective_due_date_max)}`
  }
  return formatDate(group.effective_due_date)
}

const hasGroupOverride = (group: TaxCalendarGroup): boolean =>
  group.effective_due_date_min !== group.regulatory_due_date ||
  group.effective_due_date_max !== group.regulatory_due_date

const SOURCE_TYPE_LABELS: Record<TaxCalendarGroupItemSourceType, string> = {
  vat_work_item: 'מע״מ',
  advance_payment: 'מקדמה',
  annual_report: 'דוח שנתי',
}

const getItemPath = (item: TaxCalendarGroupItem): string => {
  if (item.source_type === 'vat_work_item') return `/tax/vat/${item.source_id}`
  if (item.source_type === 'annual_report') return `/tax/reports/${item.source_id}`
  return `/clients/${item.client_record_id}/advance-payments`
}

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

const matchesClientSearch = (item: TaxCalendarGroupItem, searchText: string): boolean => {
  const normalized = searchText.trim().toLowerCase()
  if (!normalized) return true
  return [
    item.client_name,
    String(item.client_record_id),
    item.office_client_number != null ? String(item.office_client_number) : null,
  ].some((value) => value?.toLowerCase().includes(normalized))
}

const matchesClientRecord = (item: TaxCalendarGroupItem, clientRecordId?: number): boolean =>
  clientRecordId == null || item.client_record_id === clientRecordId

const getDueDatePrefix = (group: TaxCalendarGroup): string =>
  group.obligation_type === 'advance_payment' ? 'מועד תשלום' : 'מועד דיווח'

const GroupItemsRows = ({
  group,
  isOpen,
  clientSearchText,
  clientRecordId,
}: {
  group: TaxCalendarGroup
  isOpen: boolean
  clientSearchText: string
  clientRecordId?: number
}) => {
  const { data, isPending, isError, error } = useTaxCalendarGroupItems(group.tax_calendar_entry_id, isOpen)
  const items = (data?.items ?? []).filter(
    (item) => matchesClientRecord(item, clientRecordId) && matchesClientSearch(item, clientSearchText),
  )

  if (isPending) {
    return <div className="py-4 text-center text-sm text-gray-400">טוען רשומות מקושרות...</div>
  }

  if (isError) {
    return (
      <div className="bg-negative-50 px-4 py-4 text-sm text-negative-700">
        {getErrorMessage(error, 'שגיאה בטעינת רשומות מקושרות')}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-gray-400">
        {clientSearchText.trim() ? 'אין לקוחות תואמים בקבוצה זו' : 'אין רשומות מקושרות לקבוצה זו'}
      </div>
    )
  }

  return (
    <div className="bg-gray-50/70 px-2 py-2">
      <table className="w-full border-collapse text-right text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-400">
            <th className="px-3 py-1.5 text-xs font-medium">לקוח</th>
            <th className="px-3 py-1.5 text-xs font-medium">מס׳ לקוח</th>
            <th className="px-3 py-1.5 text-xs font-medium">סוג רשומה</th>
            <th className="px-3 py-1.5 text-xs font-medium">מצב</th>
            <th className="px-3 py-1.5 text-xs font-medium">פעולה</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/80">
          {items.map((item) => (
            <tr key={`${item.source_type}-${item.source_id}`} className="transition-colors hover:bg-white/70">
              <td className="px-3 py-1.5">
                <Link
                  className="block max-w-[240px] truncate font-medium text-primary-700 hover:text-primary-900"
                  to={`/clients/${item.client_record_id}`}
                >
                  {item.client_name ?? `לקוח #${item.client_record_id}`}
                </Link>
              </td>
              <td className="px-3 py-1.5 font-mono tabular-nums text-gray-600">
                {formatPlainIdentifier(item.office_client_number)}
              </td>
              <td className="px-3 py-1.5 text-gray-600">{SOURCE_TYPE_LABELS[item.source_type]}</td>
              <td className="px-3 py-1.5">
                <Badge variant={getStateVariant(item)}>{getStateLabel(item)}</Badge>
              </td>
              <td className="px-3 py-1.5">
                <Link className="font-medium text-primary-700 hover:text-primary-900" to={getItemPath(item)}>
                  פתח
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const TaxCalendarGroupsTable = ({
  groups,
  isLoading = false,
  clientSearchText = '',
  clientRecordId,
}: TaxCalendarGroupsTableProps) => {
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
    <div className="space-y-2" dir="rtl">
      {groups.map((group) => {
        const isOpen = openEntryId === group.tax_calendar_entry_id
        const effectiveRelativeLabel = formatRelativeDueLabel(group.effective_due_date)
        const metrics: PeriodSummaryMetric[] = [
          { label: 'סה״כ מקושרים', value: group.linked_count },
          { label: 'פתוחים', value: group.open_count, tone: group.open_count > 0 ? 'warning' : 'muted' },
          { label: 'באיחור', value: group.overdue_count, tone: group.overdue_count > 0 ? 'danger' : 'muted' },
          { label: 'הושלמו', value: group.done_count, tone: group.done_count > 0 ? 'success' : 'muted' },
        ]

        return (
          <GroupedPeriodRow
            key={group.tax_calendar_entry_id}
            typeLabel={formatGroupTitle(group)}
            primaryLabel={`${getDueDatePrefix(group)}: ${formatEffectiveDueDateRange(group)}`}
            secondaryLabel={
              hasGroupOverride(group)
                ? `מועד רשמי: ${formatDate(group.regulatory_due_date)} · מועד אפקטיבי: ${formatEffectiveDueDateRange(group)}`
                : `מועד רשמי: ${formatDate(group.regulatory_due_date)}`
            }
            relativeDueLabel={effectiveRelativeLabel}
            isOpen={isOpen}
            onToggle={(nextOpen) => setOpenEntryId(nextOpen ? group.tax_calendar_entry_id : null)}
            metrics={metrics}
            ctaLabel="פתח לקוחות"
            closeLabel="סגור"
            className={cn(group.overdue_count > 0 && 'border-r-2 border-r-negative-500')}
          >
            <GroupItemsRows
              group={group}
              isOpen={isOpen}
              clientSearchText={clientSearchText}
              clientRecordId={clientRecordId}
            />
          </GroupedPeriodRow>
        )
      })}
    </div>
  )
}

TaxCalendarGroupsTable.displayName = 'TaxCalendarGroupsTable'
