import { AlertTriangle } from 'lucide-react'
import { dateColumn, monoColumn, statusColumn, textColumn, type Column } from '@/components/ui/table'
import type { VatWorkItemListItem } from '../../api'
import { getVatWorkItemStatusLabel } from '../../constants/vatConstants'
import { formatClientOfficeId, formatDate } from '@/utils/utils'
import { VAT_DEADLINE_WARNING_DAYS, VAT_STATUS_BADGE_VARIANTS } from '../../constants/vatConstants'
import { formatVatAmount, isFiled } from '../../utils/vatHelpers'
import { VatWorkItemRowActions } from './VatWorkItemRowActions'
import type { ColumnOpts } from '../../types'
import { Badge } from '@/components/ui/primitives/Badge'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { formatVatPeriodTitle } from '../../utils/viewHelpers'
import { VAT_MESSAGES } from '../../messages'

export const buildVatWorkItemColumns = (opts: ColumnOpts): Column<VatWorkItemListItem>[] => [
  monoColumn({
    key: 'office_client_number',
    header: VAT_MESSAGES.columns.officeClientNumber,
    getValue: (item) => formatClientOfficeId(item.office_client_number),
  }),
  {
    key: 'client_id',
    header: VAT_MESSAGES.columns.client,
    render: (item) => {
      const name = item.client_name ?? formatClientOfficeId(item.office_client_number)
      const showPeriod = opts.duplicateClientIds?.has(item.client_record_id)

      return (
        <span className="mx-auto block max-w-[220px]">
          <span className="block truncate font-semibold text-gray-900">{name}</span>
          {showPeriod && <span className="block text-xs text-gray-500">{VAT_MESSAGES.columns.vatItemId(item.id)}</span>}
        </span>
      )
    },
  },
  monoColumn({
    key: 'client_id_number',
    header: VAT_MESSAGES.columns.idNumber,
    getValue: (item) => item.client_id_number,
  }),
  textColumn({
    key: 'period',
    header: VAT_MESSAGES.columns.reportingPeriod,
    getValue: (item) => formatVatPeriodTitle(item.period, item.period_type),
  }),
  statusColumn({
    key: 'status',
    header: VAT_MESSAGES.columns.status,
    getStatus: (item) => item.status,
    getLabel: getVatWorkItemStatusLabel,
    variantMap: VAT_STATUS_BADGE_VARIANTS,
  }),
  {
    key: 'net_vat',
    header: VAT_MESSAGES.columns.netVat,
    render: (item) => {
      const amount = item.is_overridden && item.final_vat_amount != null ? item.final_vat_amount : item.net_vat
      return (
        <span
          dir="ltr"
          className={`inline-flex items-center gap-1 font-mono text-sm font-semibold tabular-nums ${
            Number(amount) === 0
              ? 'text-gray-400'
              : Number(amount) > 0
                ? semanticMonoToneClasses.negative
                : semanticMonoToneClasses.positive
          }`}
        >
          {formatVatAmount(amount)}
          {item.is_overridden && (
            <Badge variant="warning" size="xs">
              {VAT_MESSAGES.columns.overrideBadge}
            </Badge>
          )}
        </span>
      )
    },
  },
  {
    key: 'submission_deadline',
    header: VAT_MESSAGES.columns.dueDate,
    render: (item) => {
      const displayDeadline = item.extended_deadline ?? item.submission_deadline
      if (!displayDeadline) return <span className="text-gray-400">—</span>
      const filed = isFiled(item.status)
      const overdue = item.is_overdue && !filed
      const cls = overdue
        ? `${semanticMonoToneClasses.negative} font-semibold`
        : !filed && item.days_until_deadline != null && item.days_until_deadline <= VAT_DEADLINE_WARNING_DAYS
          ? `${semanticMonoToneClasses.warning} font-medium`
          : 'text-gray-600'
      return (
        <span className={`font-mono text-sm tabular-nums inline-flex items-center gap-1 ${cls}`}>
          {overdue && <AlertTriangle className="h-3.5 w-3.5" />}
          {formatDate(displayDeadline)}
        </span>
      )
    },
  },
  dateColumn({
    key: 'updated_at',
    header: VAT_MESSAGES.columns.updatedAt,
    getValue: (item) => item.updated_at,
  }),
  dateColumn({
    key: 'filed_at',
    header: VAT_MESSAGES.columns.filedAt,
    getValue: (item) => item.filed_at,
  }),
  {
    key: 'actions',
    header: '',
    render: (item) => (
      <VatWorkItemRowActions
        item={item}
        isLoading={opts.isLoading}
        isDisabled={opts.isDisabled}
        runAction={opts.runAction}
        canDelete={opts.canDeleteWorkItem(item)}
        isDeleting={opts.isDeleting}
        onDeleteRequest={opts.onDeleteRequest}
      />
    ),
  },
]
