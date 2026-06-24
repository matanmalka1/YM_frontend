import { DrawerField, DrawerSection } from '@/components/ui/overlays/DrawerPrimitives'
import { formatShekelAmount, formatDate } from '@/utils/utils'
import { getAdvancePaymentMethodLabel } from '../../constants'
import { formatAdvanceRate } from '../../utils/advancePaymentDrawerModel'
import type { AdvancePaymentDrawerModel } from '../../utils/advancePaymentDrawerModel'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentReadonlySectionsProps {
  model: AdvancePaymentDrawerModel
}

export const AdvancePaymentReadonlySections: React.FC<AdvancePaymentReadonlySectionsProps> = ({ model }) => (
  <DrawerSection title={ADVANCED_PAYMENTS_MESSAGES.readonlySections.sectionTitle}>
    <DrawerField
      label={ADVANCED_PAYMENTS_MESSAGES.readonlySections.paidAmountLabel}
      value={formatShekelAmount(model.paidAmount)}
    />
    <DrawerField
      label={ADVANCED_PAYMENTS_MESSAGES.readonlySections.expectedAmountLabel}
      value={formatShekelAmount(model.expectedAmount)}
    />
    <DrawerField
      label={ADVANCED_PAYMENTS_MESSAGES.readonlySections.turnoverAmountLabel}
      value={model.turnoverAmount != null ? formatShekelAmount(model.turnoverAmount) : null}
    />
    <DrawerField
      label={ADVANCED_PAYMENTS_MESSAGES.readonlySections.advanceRateLabel}
      value={formatAdvanceRate(model.advanceRate)}
    />
    <DrawerField
      label={ADVANCED_PAYMENTS_MESSAGES.readonlySections.calculatedAmountLabel}
      value={model.calculatedAmount != null ? formatShekelAmount(model.calculatedAmount) : null}
    />
    <DrawerField
      label={ADVANCED_PAYMENTS_MESSAGES.readonlySections.overrideAmountLabel}
      value={model.overrideAmount != null ? formatShekelAmount(model.overrideAmount) : null}
    />
    <DrawerField
      label={ADVANCED_PAYMENTS_MESSAGES.readonlySections.paymentMethodLabel}
      value={model.paymentMethod ? getAdvancePaymentMethodLabel(model.paymentMethod) : null}
    />
    <DrawerField
      label={ADVANCED_PAYMENTS_MESSAGES.readonlySections.paidAtLabel}
      value={model.paidAt ? formatDate(model.paidAt) : null}
    />
    <DrawerField label={ADVANCED_PAYMENTS_MESSAGES.readonlySections.notesLabel} value={model.notes} />
  </DrawerSection>
)

AdvancePaymentReadonlySections.displayName = 'AdvancePaymentReadonlySections'
