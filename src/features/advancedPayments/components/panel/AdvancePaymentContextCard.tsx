import { Building2, ChevronLeft, CreditCard, FileText, Receipt } from 'lucide-react'
import { DefinitionList } from '@/components/ui/layout/DefinitionList'
import { Badge } from '@/components/ui/primitives/Badge'
import { Card } from '@/components/ui/primitives/Card'
import { IconChip } from '@/components/ui/primitives/IconChip'
import { ActionSurfaceLink } from '@/components/ui/primitives/ActionSurface'
import { formatShekelAmount, formatDate, formatPercent } from '@/utils/utils'
import type { AdvancePaymentRow } from '../../api/contracts'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'
import { getAdvancePaymentMonthLabel } from '../../utils/advancePaymentComponentUtils'

interface AdvancePaymentContextCardProps {
  payment: AdvancePaymentRow
  clientIdNumber?: string | null
}

const QUICK_NAV_LINKS = [
  { icon: CreditCard, label: ADVANCED_PAYMENTS_MESSAGES.detail.quickNavClientPayments, tab: 'advance-payments' },
  { icon: Receipt, label: ADVANCED_PAYMENTS_MESSAGES.detail.quickNavVat, tab: 'vat' },
  { icon: FileText, label: ADVANCED_PAYMENTS_MESSAGES.detail.quickNavAnnualReports, tab: 'annual-reports' },
] as const

export const AdvancePaymentContextCard: React.FC<AdvancePaymentContextCardProps> = ({ payment, clientIdNumber }) => {
  const advanceRateDisplay =
    payment.advance_rate != null
      ? formatPercent(payment.advance_rate, { fractionDigits: 2, fallback: `${payment.advance_rate}%` })
      : null

  // Context lists what the payment holds. An available VAT figure is not held.
  const turnoverLabel =
    payment.turnover_amount != null && payment.turnover_source != null
      ? ADVANCED_PAYMENTS_MESSAGES.detail.turnoverWithSource(formatShekelAmount(payment.turnover_amount), payment.turnover_source)
      : null

  const timingBadge = payment.paid_late
    ? { variant: 'warning' as const, label: ADVANCED_PAYMENTS_MESSAGES.detail.paidLateLabel }
    : payment.timing_status === 'overdue'
      ? { variant: 'negative' as const, label: ADVANCED_PAYMENTS_MESSAGES.detail.overdueLabel }
      : { variant: 'positive' as const, label: ADVANCED_PAYMENTS_MESSAGES.detail.paidOnTimeLabel }

  return (
    <div className="space-y-5">
      <Card
        title={ADVANCED_PAYMENTS_MESSAGES.detail.contextSectionTitle}
        icon={<IconChip icon={Building2} tone="info" size="sm" />}
        actions={
          <Badge variant={timingBadge.variant} size="xs">
            {timingBadge.label}
          </Badge>
        }
        size="compact"
        variant="outlined"
      >
        <DefinitionList
          layout="stacked"
          items={[
            ...(clientIdNumber ? [{ label: ADVANCED_PAYMENTS_MESSAGES.detail.idNumberLabel, value: clientIdNumber }] : []),
            {
              label: ADVANCED_PAYMENTS_MESSAGES.detail.periodLabel,
              value: getAdvancePaymentMonthLabel(payment.period, payment.period_months_count),
            },
            ...(advanceRateDisplay
              ? [{ label: ADVANCED_PAYMENTS_MESSAGES.detail.advanceRateLabel, value: advanceRateDisplay }]
              : []),
            {
              label: ADVANCED_PAYMENTS_MESSAGES.detail.dueDateLabel,
              value: formatDate(payment.due_date_effective ?? payment.due_date),
            },
            {
              label: ADVANCED_PAYMENTS_MESSAGES.detail.periodTurnoverLabel,
              // The fallback states why nothing is held — a filed return waiting to
              // be snapshotted is a different situation from no return at all.
              value: turnoverLabel ?? (
                <span className="text-gray-400 text-xs">
                  {payment.available_turnover != null
                    ? ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.available(
                        payment.available_turnover.source,
                        formatShekelAmount(payment.available_turnover.amount),
                      )
                    : ADVANCED_PAYMENTS_MESSAGES.detail.noVatReportNote}
                </span>
              ),
            },
          ]}
        />
      </Card>

      <Card title={ADVANCED_PAYMENTS_MESSAGES.detail.quickNavTitle} size="compact" variant="outlined" disablePadding bodyClassName="p-2">
        {QUICK_NAV_LINKS.map(({ icon: Icon, label, tab }) => (
          <ActionSurfaceLink key={tab} variant="plainRow" to={`/clients/${payment.client_record_id}/${tab}`}>
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Icon className="h-4 w-4 text-gray-400" />
              {label}
            </span>
            <ChevronLeft className="h-4 w-4 text-gray-400" />
          </ActionSurfaceLink>
        ))}
      </Card>
    </div>
  )
}

AdvancePaymentContextCard.displayName = 'AdvancePaymentContextCard'
