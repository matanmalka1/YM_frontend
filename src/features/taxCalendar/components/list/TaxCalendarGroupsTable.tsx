import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ExternalLink, FileText, Inbox } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { StateCard } from '@/components/ui/feedback/StateCard'
import {
  TableSkeleton,
  actionsColumn,
  monoColumn,
  PaginatedDataTable,
  RowActionItem,
  RowActionsMenu,
  textColumn,
  GroupedPeriodRow,
  formatRelativeDueLabel,
  type Column,
  type PeriodSummaryMetric,
} from '@/components/ui/table'
import { isCurrentReportingPeriod } from '@/utils/reportingPeriod'
import { cn, formatDate, formatPlainIdentifier, getErrorMessage } from '@/utils/utils'
import { useDefaultOpenGroup } from '@/hooks/useDefaultOpenGroup'
import { useTaxCalendarGroupItems } from '../../hooks/useTaxCalendarGroupItems'
import { PAGE_SIZE_SM as ITEM_PAGE_SIZE } from '@/constants/pagination.constants'
import { type TaxCalendarGroup, type TaxCalendarGroupItem } from '../../api'
import {
  formatTaxCalendarEffectiveDueDateRange,
  formatTaxCalendarGroupTitle,
  getTaxCalendarGroupDueDatePrefix,
  getTaxCalendarItemPath,
  getTaxCalendarItemStateLabel,
  getTaxCalendarItemStateVariant,
  getTaxCalendarSourceTypeLabel,
  hasTaxCalendarGroupOverride,
} from '../../helpers'
import { TAX_CALENDAR_MESSAGES } from '../../messages'
import { TAX_CALENDAR_ERROR_MESSAGES } from '../../errorMessages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface TaxCalendarGroupsTableProps {
  groups: TaxCalendarGroup[]
  isLoading?: boolean
  clientSearchText?: string
  clientRecordId?: number
}

const GroupItemsRows = ({
  group,
  clientSearchText,
  clientRecordId,
}: {
  group: TaxCalendarGroup
  clientSearchText: string
  clientRecordId?: number
}) => {
  const navigate = useNavigate()
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
        {clientSearchText.trim() ? TAX_CALENDAR_MESSAGES.list.noMatchingClients : TAX_CALENDAR_MESSAGES.list.noLinkedRecords}
      </div>
    )
  }

  const columns: Column<TaxCalendarGroupItem>[] = [
    monoColumn({
      key: 'office',
      header: TAX_CALENDAR_MESSAGES.item.clientNumber,
      getValue: (item) => formatPlainIdentifier(item.office_client_number),
    }),
    {
      key: 'client',
      header: GLOBAL_UI_MESSAGES.common.clientName,
      render: (item) => (
        <Link
          className="block max-w-[240px] truncate font-semibold text-gray-900 hover:text-info-600 hover:underline"
          to={`/clients/${item.client_record_id}`}
        >
          {item.client_name ?? TAX_CALENDAR_MESSAGES.item.clientName(item.client_record_id)}
        </Link>
      ),
    },
    textColumn({
      key: 'type',
      header: TAX_CALENDAR_MESSAGES.item.recordType,
      getValue: getTaxCalendarSourceTypeLabel,
    }),
    {
      key: 'state',
      header: TAX_CALENDAR_MESSAGES.item.status,
      kind: 'status',
      render: (item) => <Badge variant={getTaxCalendarItemStateVariant(item)}>{getTaxCalendarItemStateLabel(item)}</Badge>,
    },
    actionsColumn({
      key: 'action',
      header: '',
      render: (item) => (
        <RowActionsMenu
          ariaLabel={TAX_CALENDAR_MESSAGES.item.rowActionsAriaLabel(
            item.client_name ?? TAX_CALENDAR_MESSAGES.item.clientName(item.client_record_id),
          )}
        >
          <RowActionItem
            label={GLOBAL_UI_MESSAGES.actions.open}
            icon={<FileText className="h-3.5 w-3.5" />}
            onClick={() => navigate(getTaxCalendarItemPath(item))}
          />
          <RowActionItem
            label={TAX_CALENDAR_MESSAGES.item.goToClientAction}
            icon={<ExternalLink className="h-3.5 w-3.5" />}
            onClick={() => navigate(`/clients/${item.client_record_id}`)}
          />
        </RowActionsMenu>
      ),
    }),
  ]

  return (
    <PaginatedDataTable
      data={items}
      columns={columns}
      getRowKey={(item) => `${item.source_type}-${item.source_id}`}
      page={page}
      pageSize={ITEM_PAGE_SIZE}
      total={data?.total ?? 0}
      label={TAX_CALENDAR_MESSAGES.list.records}
      onPageChange={setPage}
    />
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
            typeLabel={formatTaxCalendarGroupTitle(group)}
            primaryLabel={`${getTaxCalendarGroupDueDatePrefix(group)}: ${formatTaxCalendarEffectiveDueDateRange(group)}`}
            secondaryLabel={
              hasTaxCalendarGroupOverride(group)
                ? TAX_CALENDAR_MESSAGES.group.officialAndEffectiveDue(
                    formatDate(group.regulatory_due_date),
                    formatTaxCalendarEffectiveDueDateRange(group),
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
