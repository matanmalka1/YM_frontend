import { GLOBAL_UI_MESSAGES } from '@/messages'
import { DefinitionList } from '@/components/ui/layout/DefinitionList'
import { Card } from '@/components/ui/primitives/Card'
import { formatShekelAmount, formatDate, formatPercent } from '@/utils/utils'
import type { AdvancePaymentRow } from '../../api/contracts'
import { getAdvancePaymentMethodLabel } from '../../constants'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentReadonlySectionsProps {
  payment: AdvancePaymentRow
}

export const AdvancePaymentReadonlySections: React.FC<AdvancePaymentReadonlySectionsProps> = ({ payment }) => (
  <Card title={ADVANCED_PAYMENTS_MESSAGES.readonlySections.sectionTitle} size="compact" variant="outlined">
    <DefinitionList
      layout="stacked"
      items={[
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.paidAmountLabel,
          value: formatShekelAmount(payment.paid_amount),
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.expectedAmountLabel,
          value: formatShekelAmount(payment.expected_amount),
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.turnoverAmountLabel,
          value: payment.turnover_amount != null ? formatShekelAmount(payment.turnover_amount) : null,
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.advanceRateLabel,
          value:
            payment.advance_rate != null
              ? formatPercent(payment.advance_rate, { fractionDigits: 2, fallback: `${payment.advance_rate}%` })
              : null,
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.calculatedAmountLabel,
          value: payment.calculated_amount != null ? formatShekelAmount(payment.calculated_amount) : null,
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.overrideAmountLabel,
          value: payment.override_amount != null ? formatShekelAmount(payment.override_amount) : null,
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.paymentMethodLabel,
          value: payment.payment_method ? getAdvancePaymentMethodLabel(payment.payment_method) : null,
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.paidAtLabel,
          value: payment.paid_at ? formatDate(payment.paid_at) : null,
        },
        { label: GLOBAL_UI_MESSAGES.common.notes, value: payment.notes },
      ]}
    />
  </Card>
)

AdvancePaymentReadonlySections.displayName = 'AdvancePaymentReadonlySections'
