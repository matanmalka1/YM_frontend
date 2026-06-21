import { CalendarDays, Clock, FileText, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { Card } from '@/components/ui/primitives/Card'
import { Badge } from '@/components/ui/primitives/Badge'
import { cn, formatDate } from '@/utils/utils'
import type { VatPeriodRow } from '../../api'
import { getVatClientSummaryStatusVariant } from '../../constants/vatConstants'
import { getVatWorkItemStatusLabel } from '../../constants/vatConstants'
import { formatVatAmount } from '../../utils/vatHelpers'
import { formatVatPeriodLabel, getNetVatTone } from '../../utils/viewHelpers'

const getDaysToDueLabel = (days: number | null): { label: string; overdue: boolean } | null => {
  if (days === null) return null
  if (days === 0) return { label: 'היום', overdue: false }
  if (days > 0) return { label: `עוד ${days} ימים`, overdue: false }
  return { label: `באיחור ${Math.abs(days)} ימים`, overdue: true }
}

interface VatMetricRowProps {
  icon: React.ReactNode
  label: string
  value: string
  valueClassName?: string
}

const VatMetricRow = ({ icon, label, value, valueClassName }: VatMetricRowProps) => (
  <div className="flex items-center justify-between gap-4">
    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500">
      <span className="text-gray-400">{icon}</span>
      {label}
    </span>
    <span dir="ltr" className={cn('text-sm font-bold text-gray-950 font-mono tabular-nums', valueClassName)}>
      {value}
    </span>
  </div>
)

interface VatPeriodCardProps {
  row: VatPeriodRow
  onOpen: () => void
  disabled?: boolean
  className?: string
}

export const VatPeriodCard = ({ row, onOpen, disabled, className }: VatPeriodCardProps) => {
  const isBimonthly = row.period_type === 'bimonthly'
  const periodLabel = formatVatPeriodLabel(row.period, isBimonthly)
  const statusVariant = getVatClientSummaryStatusVariant(row.status)
  const statusLabel = getVatWorkItemStatusLabel(row.status)

  const isFiled = row.status === 'filed'

  const dueDateLabel = isFiled && row.filed_at ? formatDate(row.filed_at) : formatDate(row.submission_deadline)

  const dueDateRowLabel = isFiled && row.filed_at ? 'תאריך הגשה' : 'מועד הגשה'

  const daysToDue = isFiled ? null : getDaysToDueLabel(row.days_until_deadline)

  const netVat = Number(row.net_vat)
  const isRefund = netVat < 0
  const netLabel = isRefund ? 'נטו להחזר' : 'נטו לתשלום'
  const netBg = isRefund ? 'bg-success-50' : 'bg-gray-50'
  const netTextClass = getNetVatTone(row.net_vat)

  return (
    <Card className={cn('h-full', className)}>
      <div className="flex h-full flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-950">{periodLabel}</p>
            <div className="mt-2">
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-3 border-y border-gray-100 py-4">
          <VatMetricRow icon={<CalendarDays className="h-4 w-4" />} label={dueDateRowLabel} value={dueDateLabel} />
          {daysToDue && (
            <VatMetricRow
              icon={<Clock className="h-4 w-4" />}
              label="ימים למועד"
              value={daysToDue.label}
              valueClassName={daysToDue.overdue ? 'text-negative-600' : 'text-success-700'}
            />
          )}
          <VatMetricRow
            icon={<TrendingUp className="h-4 w-4" />}
            label="מע״מ עסקאות"
            value={formatVatAmount(row.total_output_vat)}
          />
          <VatMetricRow
            icon={<TrendingDown className="h-4 w-4" />}
            label="מע״מ תשומות"
            value={formatVatAmount(row.total_input_vat)}
          />
        </div>

        {/* Net VAT highlight */}
        <div className={cn('rounded-lg px-4 py-3', netBg)}>
          <div className="flex items-center justify-between gap-3">
            <span className={cn('inline-flex items-center gap-2 text-sm font-bold', netTextClass)}>
              <Wallet className="h-4 w-4" />
              {netLabel}
            </span>
            <span dir="ltr" className={cn('text-lg font-bold font-mono tabular-nums', netTextClass)}>
              {formatVatAmount(Math.abs(netVat))}
            </span>
          </div>
        </div>

        {/* Action */}
        <Button fullWidth onClick={onOpen} disabled={disabled} className="mt-auto">
          <FileText className="h-4 w-4" />
          פתח דוח
        </Button>
      </div>
    </Card>
  )
}

VatPeriodCard.displayName = 'VatPeriodCard'
