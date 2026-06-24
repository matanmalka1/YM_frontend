import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { TableSkeleton } from '@/components/ui/table/TableSkeleton'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import { type Column } from '@/components/ui/table/DataTable'
import { GroupedPeriodRow, type PeriodSummaryMetric } from '@/components/ui/table/GroupedPeriodRow'
import { formatRelativeDueLabel } from '@/components/ui/table/groupedPeriodRow.utils'
import { isCurrentReportingPeriod } from '@/utils/reportingPeriod'
import { cn, formatDate, formatPlainIdentifier, getErrorMessage, getReportingPeriodLabelWithYear } from '@/utils/utils'
import { useDefaultOpenGroup } from '@/hooks/useDefaultOpenGroup'
import { useTaxCalendarGroupItems } from '../../hooks/useTaxCalendarGroupItems'
import { PAGE_SIZE_MD as ITEM_PAGE_SIZE } from '@/constants/pagination.constants'
import {
  TAX_CALENDAR_OBLIGATION_LABELS,
  type TaxCalendarGroup,
  type TaxCalendarGroupItem,
  type TaxCalendarGroupItemSourceType,
} from '../../api'

interface TaxCalendarGroupsTableProps {
  groups: TaxCalendarGroup[]
  isLoading?: boolean
  clientSearchText?: string
  clientRecordId?: number
}

const formatGroupTitle = (group: TaxCalendarGroup): string => {
  const obligationLabel = TAX_CALENDAR_OBLIGATION_LABELS[group.obligation_type]
  const periodLabel = getReportingPeriodLabelWithYear(group.period, group.period_months_count, group.tax_year)
  return `${obligationLabel} · ${periodLabel}`
}

const formatEffectiveDueDateRange = (group: TaxCalendarGroup): string => {
  if (group.effective_due_date_min !== group.effective_due_date_max) {
    return `${formatDate(group.effective_due_date_min)}–${formatDate(group.effective_due_date_max)}`
  }
  return formatDate(group.effective_due_date_min)
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

const getStateVariant = (item: TaxCalendarGroupItem): 'positive' | 'warning' | 'negative' => {
  if (item.done) return 'positive'
  if (item.overdue) return 'negative'
  return 'warning'
}

const getDueDatePrefix = (group: TaxCalendarGroup): string =>
  group.obligation_type === 'advance_payment' ? 'מועד תשלום' : 'מועד דיווח'

const GroupItemsRows = ({
  group,
  clientSearchText,
  clientRecordId,
}: {
  group: TaxCalendarGroup
  clientSearchText: string
  clientRecordId?: number
}) => {
  const [page, setPage] = useState(1)
  useEffect(() => {
    setPage(1)
  }, [clientSearchText, group.tax_calendar_entry_id])
  const { data, isPending, isError, error } = useTaxCalendarGroupItems(group.tax_calendar_entry_id, true, {
    page,
    page_size: ITEM_PAGE_SIZE,
    client_search: clientSearchText.trim() || undefined,
    client_record_id: clientRecordId,
  })
  const items = data?.items ?? []

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

  const columns: Column<TaxCalendarGroupItem>[] = [
    {
      key: 'client',
      header: 'לקוח',
      align: 'right',
      render: (item) => (
        <Link
          className="block max-w-[240px] truncate font-medium text-primary-700 hover:text-primary-900"
          to={`/clients/${item.client_record_id}`}
        >
          {item.client_name ?? `לקוח #${item.client_record_id}`}
        </Link>
      ),
    },
    {
      key: 'office',
      header: 'מס׳ לקוח',
      align: 'right',
      render: (item) => formatPlainIdentifier(item.office_client_number),
      className: 'font-mono tabular-nums text-gray-600',
    },
    {
      key: 'type',
      header: 'סוג רשומה',
      align: 'right',
      render: (item) => SOURCE_TYPE_LABELS[item.source_type],
      className: 'text-gray-600',
    },
    {
      key: 'state',
      header: 'מצב',
      align: 'right',
      render: (item) => <Badge variant={getStateVariant(item)}>{getStateLabel(item)}</Badge>,
    },
    {
      key: 'action',
      header: 'פעולה',
      align: 'right',
      render: (item) => (
        <Link className="font-medium text-primary-700 hover:text-primary-900" to={getItemPath(item)}>
          פתח
        </Link>
      ),
    },
  ]

  return (
    <div className="bg-gray-50/70 px-2 py-2">
      <PaginatedDataTable
        data={items}
        columns={columns}
        getRowKey={(item) => `${item.source_type}-${item.source_id}`}
        surface="bare"
        density="compact"
        page={page}
        pageSize={ITEM_PAGE_SIZE}
        total={data?.total ?? 0}
        label="רשומות"
        onPageChange={setPage}
        showPagination={Boolean(data && data.total > ITEM_PAGE_SIZE)}
      />
    </div>
  )
}

export const TaxCalendarGroupsTable = ({
  groups,
  isLoading = false,
  clientSearchText = '',
  clientRecordId,
}: TaxCalendarGroupsTableProps) => {
  const getKey = useCallback((g: TaxCalendarGroup) => String(g.tax_calendar_entry_id), [])
  const getDueDate = useCallback((g: TaxCalendarGroup) => g.effective_due_date_min, [])
  const defaultOpenKey = useDefaultOpenGroup(groups, getKey, getDueDate)

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
    <div className="space-y-2">
      {groups.map((group) => {
        const isCurrentPeriod = isCurrentReportingPeriod(group.period, group.period_months_count)
        const effectiveRelativeLabel = formatRelativeDueLabel(group.effective_due_date_min)
        const metrics: PeriodSummaryMetric[] = [
          { label: 'סה״כ מקושרים', value: group.linked_count },
          { label: 'פתוחים', value: group.open_count, tone: group.open_count > 0 ? 'warning' : 'muted' },
          { label: 'באיחור', value: group.overdue_count, tone: group.overdue_count > 0 ? 'negative' : 'muted' },
          { label: 'הושלמו', value: group.done_count, tone: group.done_count > 0 ? 'positive' : 'muted' },
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
            isCurrentPeriod={isCurrentPeriod}
            defaultOpen={String(group.tax_calendar_entry_id) === defaultOpenKey}
            metrics={metrics}
            ctaLabel="פתח לקוחות"
            closeLabel="סגור"
            className={cn(group.overdue_count > 0 && 'border-r-2 border-r-negative-500')}
          >
            <GroupItemsRows group={group} clientSearchText={clientSearchText} clientRecordId={clientRecordId} />
          </GroupedPeriodRow>
        )
      })}
    </div>
  )
}

TaxCalendarGroupsTable.displayName = 'TaxCalendarGroupsTable'
