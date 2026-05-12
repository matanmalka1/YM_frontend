import { AlertTriangle } from 'lucide-react'
import { monoColumn, statusColumn, textColumn, type Column } from '../../../components/ui/table'
import type { VatWorkItemResponse } from '../api'
import { getVatWorkItemStatusLabel } from '../../../utils/enums'
import { formatClientOfficeId, formatDate } from '@/utils/utils'
import { VAT_DEADLINE_WARNING_DAYS, VAT_STATUS_BADGE_VARIANTS } from '../constants'
import { formatVatAmount, isFiled } from '../utils'
import { VatWorkItemRowActions } from './VatWorkItemRowActions'
import type { ColumnOpts } from '../types'
import { Badge } from '../../../components/ui/primitives/Badge'
import { semanticMonoToneClasses } from '../../../utils/semanticColors'
import { formatVatPeriodTitle } from '../view.helpers'

export const buildVatWorkItemColumns = (opts: ColumnOpts): Column<VatWorkItemResponse>[] => [
  monoColumn({
    key: 'office_client_number',
    header: "מס' לקוח",
    getValue: (item) => formatClientOfficeId(item.office_client_number),
  }),
  {
    key: 'client_id',
    header: 'לקוח',
    render: (item) => {
      const name = item.client_name ?? formatClientOfficeId(item.office_client_number)
      const showPeriod = opts.duplicateClientIds?.has(item.client_record_id)

      return (
        <span className="block max-w-[220px]">
          <span className="block truncate font-semibold text-gray-900">{name}</span>
          {showPeriod && <span className="block text-xs font-medium text-gray-500">פריט מע״מ #{item.id}</span>}
        </span>
      )
    },
  },
  monoColumn({
    key: 'client_id_number',
    header: 'ת.ז / ח.פ',
    getValue: (item) => item.client_id_number,
  }),
  textColumn({
    key: 'period',
    header: 'תקופת דיווח',
    getValue: (item) => formatVatPeriodTitle(item.period, item.period_type),
  }),
  statusColumn({
    key: 'status',
    header: 'סטטוס',
    headerClassName: 'text-center',
    className: 'text-center',
    getStatus: (item) => item.status,
    getLabel: getVatWorkItemStatusLabel,
    variantMap: VAT_STATUS_BADGE_VARIANTS,
  }),
  {
    key: 'net_vat',
    header: 'מע"מ נטו',
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
              עוקף
            </Badge>
          )}
        </span>
      )
    },
  },
  {
    key: 'submission_deadline',
    header: 'מועד הגשה',
    render: (item) => {
      const displayDeadline = item.extended_deadline ?? item.submission_deadline
      if (!displayDeadline) return <span className="text-gray-400 text-sm">—</span>
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
  textColumn({
    key: 'updated_at',
    header: 'עדכון אחרון',
    valueClassName: 'text-gray-400 tabular-nums',
    getValue: (item) => formatDate(item.updated_at),
  }),
  textColumn({
    key: 'filed_at',
    header: 'הוגש ב',
    valueClassName: 'tabular-nums',
    getValue: (item) => (item.filed_at ? formatDate(item.filed_at) : null),
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
      />
    ),
  },
]
