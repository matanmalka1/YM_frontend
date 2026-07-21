import { CalendarDays, Clock, FileText, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { Card } from '@/components/ui/primitives/Card'
import { Badge } from '@/components/ui/primitives/Badge'
import { MonoValue } from '@/components/ui/primitives/MonoValue'
import { cn, formatDate } from '@/utils/utils'
import type { VatPeriodRow } from '../../api'
import { getVatClientSummaryStatusVariant } from '../../constants/vatConstants'
import { getVatWorkItemStatusLabel } from '../../constants/vatConstants'
import { formatVatAmount } from '../../utils/vatHelpers'
import { formatVatPeriodLabel, getNetVatTone } from '../../utils/viewHelpers'
import { VAT_MESSAGES } from '../../messages'

const getDaysToDueLabel = (days: number | null): { label: string; overdue: boolean } | null => {
  if (days === null) return null
  if (days === 0) return { label: VAT_MESSAGES.periodCard.today, overdue: false }
  if (days > 0) return { label: VAT_MESSAGES.periodCard.daysRemaining(days), overdue: false }
  return { label: VAT_MESSAGES.periodCard.daysOverdue(Math.abs(days)), overdue: true }
}

type MonoTone = 'neutral' | 'positive' | 'negative' | 'warning' | 'critical'

interface VatMetricRowProps {
  icon: React.ReactNode
  label: string
  value: string
  tone?: MonoTone
}

const VatMetricRow = ({ icon, label, value, tone = 'neutral' }: VatMetricRowProps) => (
  <div className="flex items-center justify-between gap-4">
    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500">
      <span className="text-gray-400">{icon}</span>
      {label}
    </span>
    <span dir="ltr">
      <MonoValue value={value} tone={tone} />
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

  const dueDateRowLabel = isFiled && row.filed_at ? VAT_MESSAGES.periodCard.filedAtLabel : VAT_MESSAGES.periodCard.dueDateLabel

  const daysToDue = isFiled ? null : getDaysToDueLabel(row.days_until_deadline)

  const netVat = Number(row.net_vat)
  const isRefund = netVat < 0
  const netLabel = isRefund ? VAT_MESSAGES.periodCard.netRefund : VAT_MESSAGES.periodCard.netPayment
  const netBg = isRefund ? 'bg-positive-50' : 'bg-gray-50'
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
              label={VAT_MESSAGES.periodCard.daysToDueLabel}
              value={daysToDue.label}
              tone={daysToDue.overdue ? 'negative' : 'positive'}
            />
          )}
          <VatMetricRow
            icon={<TrendingUp className="h-4 w-4" />}
            label={VAT_MESSAGES.periodCard.outputVat}
            value={formatVatAmount(row.total_output_vat)}
          />
          <VatMetricRow
            icon={<TrendingDown className="h-4 w-4" />}
            label={VAT_MESSAGES.periodCard.inputVat}
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
            <span dir="ltr">
              <MonoValue
                value={formatVatAmount(Math.abs(netVat))}
                tone={isRefund ? 'positive' : 'negative'}
                className="text-lg font-bold"
              />
            </span>
          </div>
        </div>

        {/* Action */}
        <Button fullWidth icon={<FileText className="h-4 w-4" />} onClick={onOpen} disabled={disabled} className="mt-auto">
          {VAT_MESSAGES.actions.openVatReport}
        </Button>
      </div>
    </Card>
  )
}

VatPeriodCard.displayName = 'VatPeriodCard'
