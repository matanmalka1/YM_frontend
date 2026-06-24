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
import { TAX_CALENDAR_OBLIGATION_LABELS, type TaxCalendarGroup, type TaxCalendarGroupItem } from '../../api'
import { TAX_CALENDAR_SOURCE_TYPE_LABELS } from '../../constants'
import { TAX_CALENDAR_MESSAGES } from '../../messages'
import { TAX_CALENDAR_ERROR_MESSAGES } from '../../errorMessages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

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

const getItemPath = (item: TaxCalendarGroupItem): string => {
  if (item.source_type === 'vat_work_item') return `/tax/vat/${item.source_id}`
  if (item.source_type === 'annual_report') return `/tax/reports/${item.source_id}`
  return `/clients/${item.client_record_id}/advance-payments`
}

const getStateLabel = (item: TaxCalendarGroupItem): string => {
  if (item.done) return TAX_CALENDAR_MESSAGES.item.done
  if (item.overdue) return TAX_CALENDAR_MESSAGES.item.overdue
  return TAX_CALENDAR_MESSAGES.item.open
}

const getStateVariant = (item: TaxCalendarGroupItem): 'positive' | 'warning' | 'negative' => {
  if (item.done) return 'positive'
  if (item.overdue) return 'negative'
  return 'warning'
}

const getDueDatePrefix = (group: TaxCalendarGroup): string =>
  group.obligation_type === 'advance_payment'
    ? TAX_CALENDAR_MESSAGES.item.paymentDue
    : TAX_CALENDAR_MESSAGES.item.reportingDue

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
    return <div className="py-4 text-center text-sm text-gray-400">{TAX_CALENDAR_MESSAGES.list.loadingLinked}</div>
  }

  if (isError) {
    return (
      <div className="bg-negative-50 px-4 py-4 text-sm text-negative-700">
        {getErrorMessage(error, TAX_CALENDAR_ERROR_MESSAGES.list.linkedLoad)}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-gray-400">
        {clientSearchText.trim()
          ? TAX_CALENDAR_MESSAGES.list.noMatchingClients
          : TAX_CALENDAR_MESSAGES.list.noLinkedRecords}
      </div>
    )
  }

  const columns: Column<TaxCalendarGroupItem>[] = [
    {
      key: 'client',
      header: TAX_CALENDAR_MESSAGES.item.client,
      align: 'right',
      render: (item) => (
        <Link
          className="block max-w-[240px] truncate font-medium text-primary-700 hover:text-primary-900"
          to={`/clients/${item.client_record_id}`}
        >
          {item.client_name ?? TAX_CALENDAR_MESSAGES.item.clientName(item.client_record_id)}
        </Link>
      ),
    },
    {
      key: 'office',
      header: TAX_CALENDAR_MESSAGES.item.clientNumber,
      align: 'right',
      render: (item) => formatPlainIdentifier(item.office_client_number),
      className: 'font-mono tabular-nums text-gray-600',
    },
    {
      key: 'type',
      header: TAX_CALENDAR_MESSAGES.item.recordType,
      align: 'right',
      render: (item) => TAX_CALENDAR_SOURCE_TYPE_LABELS[item.source_type],
      className: 'text-gray-600',
    },
    {
      key: 'state',
      header: TAX_CALENDAR_MESSAGES.item.status,
      align: 'right',
      render: (item) => <Badge variant={getStateVariant(item)}>{getStateLabel(item)}</Badge>,
    },
    {
      key: 'action',
      header: TAX_CALENDAR_MESSAGES.item.action,
      align: 'right',
      render: (item) => (
        <Link className="font-medium text-primary-700 hover:text-primary-900" to={getItemPath(item)}>
          {TAX_CALENDAR_MESSAGES.item.openAction}
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
        label={TAX_CALENDAR_MESSAGES.list.records}
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
        title={TAX_CALENDAR_MESSAGES.list.noGroupsTitle}
        message={TAX_CALENDAR_MESSAGES.list.noGroupsMessage}
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
          { label: TAX_CALENDAR_MESSAGES.group.linkedTotal, value: group.linked_count },
          {
            label: TAX_CALENDAR_MESSAGES.group.open,
            value: group.open_count,
            tone: group.open_count > 0 ? 'warning' : 'muted',
          },
          {
            label: TAX_CALENDAR_MESSAGES.group.overdue,
            value: group.overdue_count,
            tone: group.overdue_count > 0 ? 'negative' : 'muted',
          },
          {
            label: TAX_CALENDAR_MESSAGES.group.done,
            value: group.done_count,
            tone: group.done_count > 0 ? 'positive' : 'muted',
          },
        ]

        return (
          <GroupedPeriodRow
            key={group.tax_calendar_entry_id}
            typeLabel={formatGroupTitle(group)}
            primaryLabel={`${getDueDatePrefix(group)}: ${formatEffectiveDueDateRange(group)}`}
            secondaryLabel={
              hasGroupOverride(group)
                ? TAX_CALENDAR_MESSAGES.group.officialAndEffectiveDue(
                    formatDate(group.regulatory_due_date),
                    formatEffectiveDueDateRange(group),
                  )
                : TAX_CALENDAR_MESSAGES.group.officialDue(formatDate(group.regulatory_due_date))
            }
            relativeDueLabel={effectiveRelativeLabel}
            isCurrentPeriod={isCurrentPeriod}
            defaultOpen={String(group.tax_calendar_entry_id) === defaultOpenKey}
            metrics={metrics}
            ctaLabel={TAX_CALENDAR_MESSAGES.group.openClients}
            closeLabel={GLOBAL_UI_MESSAGES.actions.close}
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
