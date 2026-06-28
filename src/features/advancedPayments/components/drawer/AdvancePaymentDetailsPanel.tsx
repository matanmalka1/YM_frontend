import { DefinitionList } from '@/components/ui/layout/DefinitionList'
import { DrawerSection } from '@/components/ui/overlays/DrawerPrimitives'
import { formatShekelAmount, formatDate } from '@/utils/utils'
import { getAdvancePaymentMethodLabel } from '../../constants'
import { formatAdvanceRate } from '../../utils/advancePaymentDrawerModel'
import type { AdvancePaymentDrawerModel } from '../../utils/advancePaymentDrawerModel'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentDetailsPanelProps {
  model: AdvancePaymentDrawerModel
}

export const AdvancePaymentDetailsPanel: React.FC<AdvancePaymentDetailsPanelProps> = ({ model }) => (
  <DrawerSection title={ADVANCED_PAYMENTS_MESSAGES.readonlySections.sectionTitle}>
    <DefinitionList
      layout="stacked"
      items={[
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.paidAmountLabel,
          value: formatShekelAmount(model.paidAmount),
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.expectedAmountLabel,
          value: formatShekelAmount(model.expectedAmount),
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.turnoverAmountLabel,
          value: model.turnoverAmount != null ? formatShekelAmount(model.turnoverAmount) : null,
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.advanceRateLabel,
          value: formatAdvanceRate(model.advanceRate),
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.calculatedAmountLabel,
          value: model.calculatedAmount != null ? formatShekelAmount(model.calculatedAmount) : null,
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.overrideAmountLabel,
          value: model.overrideAmount != null ? formatShekelAmount(model.overrideAmount) : null,
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.paymentMethodLabel,
          value: model.paymentMethod ? getAdvancePaymentMethodLabel(model.paymentMethod) : null,
        },
        {
          label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.paidAtLabel,
          value: model.paidAt ? formatDate(model.paidAt) : null,
        },
        { label: ADVANCED_PAYMENTS_MESSAGES.readonlySections.notesLabel, value: model.notes },
      ]}
    />
  </DrawerSection>
)

AdvancePaymentDetailsPanel.displayName = 'AdvancePaymentDetailsPanel'
