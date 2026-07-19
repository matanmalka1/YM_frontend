import { CalendarDays, ChevronLeft, Inbox } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { Card } from '@/components/ui/primitives/Card'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { Alert } from '@/components/ui/overlays/Alert'
import { formatRelativeDueLabel } from '@/components/ui/table'
import { isCurrentReportingPeriod } from '@/utils/reportingPeriod'
import { cn, formatDate } from '@/utils/utils'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { useOpenClientTaxCalendarItem } from '../../hooks/useOpenClientTaxCalendarItem'
import type { TaxCalendarGroup } from '../../api'
import {
  formatTaxCalendarEffectiveDueDateRange,
  formatTaxCalendarGroupTitle,
  getTaxCalendarGroupDueDatePrefix,
  getTaxCalendarGroupStateLabel,
  getTaxCalendarGroupStateVariant,
  hasTaxCalendarGroupOverride,
} from '../../helpers'
import { TAX_CALENDAR_MESSAGES } from '../../messages'

interface ClientTaxCalendarListProps {
  groups: TaxCalendarGroup[]
  isLoading: boolean
  clientRecordId: number
}

interface ClientTaxCalendarRowProps {
  group: TaxCalendarGroup
  isOpening: boolean
  errorMessage: string | null
  isMissing: boolean
  onOpen: (taxCalendarEntryId: number) => Promise<void>
}

const ClientTaxCalendarListSkeleton = () => (
  <Card radius="xl" disablePadding className="border border-gray-200/70">
    <ul className="divide-y divide-gray-100">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index} className="grid min-h-[78px] grid-cols-[minmax(0,1fr)_minmax(150px,auto)_auto] gap-4 px-4 py-3">
          <div className="flex min-w-0 items-start gap-3">
            <SkeletonBlock shimmer rounded="xl" width="w-9" height="h-9" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock shimmer width="w-44" height="h-4" />
              <SkeletonBlock shimmer width="w-64" height="h-5" />
            </div>
          </div>
          <SkeletonBlock shimmer width="w-24" height="h-5" className="self-center" />
          <SkeletonBlock shimmer rounded="full" width="w-20" height="h-8" className="self-center" />
        </li>
      ))}
    </ul>
  </Card>
)

const ClientTaxCalendarRow = ({ group, isOpening, errorMessage, isMissing, onOpen }: ClientTaxCalendarRowProps) => {
  const relativeDueLabel = formatRelativeDueLabel(group.effective_due_date_min)
  const effectiveDueDate = formatTaxCalendarEffectiveDueDateRange(group)
  const isCurrentPeriod = isCurrentReportingPeriod(group.period, group.period_months_count)
  const stateVariant = getTaxCalendarGroupStateVariant(group)

  return (
    <li
      className={cn(
        'grid min-h-[78px] grid-cols-[minmax(0,1fr)_minmax(150px,auto)_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50/70',
        'max-lg:grid-cols-1 max-lg:items-start max-lg:gap-3',
        group.overdue_count > 0 && 'border-r-2 border-r-negative-500 bg-negative-50/20',
        isCurrentPeriod && group.overdue_count === 0 && 'border-r-2 border-r-primary-500 bg-primary-50/20',
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            'mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            stateVariant === 'negative'
              ? 'bg-negative-100 text-negative-700'
              : stateVariant === 'positive'
                ? 'bg-positive-100 text-positive-700'
                : 'bg-warning-100 text-warning-700',
          )}
        >
          <CalendarDays className="h-4 w-4" />
        </span>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{formatTaxCalendarGroupTitle(group)}</span>
            <Badge size="xs" variant={stateVariant}>
              {getTaxCalendarGroupStateLabel(group)}
            </Badge>
            {isCurrentPeriod ? <Badge size="2xs">{TAX_CALENDAR_MESSAGES.group.currentMonth}</Badge> : null}
          </div>
          <p className="truncate text-base font-bold text-gray-950">
            {getTaxCalendarGroupDueDatePrefix(group)}: {effectiveDueDate}
          </p>
          <p className="truncate text-xs font-medium text-gray-500">
            {hasTaxCalendarGroupOverride(group)
              ? TAX_CALENDAR_MESSAGES.group.officialAndEffectiveDue(
                  formatDate(group.regulatory_due_date),
                  effectiveDueDate,
                )
              : TAX_CALENDAR_MESSAGES.group.officialDue(formatDate(group.regulatory_due_date))}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-center justify-start gap-2 max-lg:ps-12">
        {relativeDueLabel ? (
          <Badge size="xs" variant={stateVariant} ring>
            {relativeDueLabel}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-col items-end gap-2 max-lg:items-start max-lg:ps-12">
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronLeft className="h-4 w-4" />}
          isLoading={isOpening}
          loadingLabel={GLOBAL_UI_MESSAGES.common.loading}
          onClick={() => void onOpen(group.tax_calendar_entry_id)}
        >
          {GLOBAL_UI_MESSAGES.actions.open}
        </Button>

        {errorMessage ? <Alert size="sm" variant="error" message={errorMessage} /> : null}
        {isMissing ? (
          <Alert size="sm" variant="error" message={TAX_CALENDAR_MESSAGES.clientTab.openUnavailable} />
        ) : null}
      </div>
    </li>
  )
}

export const ClientTaxCalendarList = ({ groups, isLoading, clientRecordId }: ClientTaxCalendarListProps) => {
  const { openItem, openingEntryId, errorEntryId, errorMessage, missingEntryId } =
    useOpenClientTaxCalendarItem(clientRecordId)

  if (isLoading) return <ClientTaxCalendarListSkeleton />

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
    <Card radius="xl" disablePadding className="border border-gray-200/70 shadow-elevation-1">
      <ul className="divide-y divide-gray-100" aria-label={TAX_CALENDAR_MESSAGES.clientTab.listAriaLabel}>
        {groups.map((group) => (
          <ClientTaxCalendarRow
            key={group.tax_calendar_entry_id}
            group={group}
            isOpening={openingEntryId === group.tax_calendar_entry_id}
            errorMessage={errorEntryId === group.tax_calendar_entry_id ? errorMessage : null}
            isMissing={missingEntryId === group.tax_calendar_entry_id}
            onOpen={openItem}
          />
        ))}
      </ul>
    </Card>
  )
}

ClientTaxCalendarList.displayName = 'ClientTaxCalendarList'
