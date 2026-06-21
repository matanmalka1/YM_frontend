import { DrawerField, DrawerSection } from '@/components/ui/overlays/DrawerPrimitives'
import { formatShekelAmount, formatDate } from '@/utils/utils'
import { getAdvancePaymentMethodLabel } from '../../constants'
import { formatAdvanceRate } from '../../utils/advancePaymentDrawerModel'
import type { AdvancePaymentDrawerModel } from '../../utils/advancePaymentDrawerModel'

interface AdvancePaymentReadonlySectionsProps {
  model: AdvancePaymentDrawerModel
}

export const AdvancePaymentReadonlySections: React.FC<AdvancePaymentReadonlySectionsProps> = ({ model }) => (
  <DrawerSection title="פרטי תשלום">
    <DrawerField label="סכום שולם" value={formatShekelAmount(model.paidAmount)} />
    <DrawerField label="סכום צפוי" value={formatShekelAmount(model.expectedAmount)} />
    <DrawerField
      label="מחזור מוזן"
      value={model.turnoverAmount != null ? formatShekelAmount(model.turnoverAmount) : null}
    />
    <DrawerField label="אחוז מקדמה" value={formatAdvanceRate(model.advanceRate)} />
    <DrawerField
      label="סכום מחושב"
      value={model.calculatedAmount != null ? formatShekelAmount(model.calculatedAmount) : null}
    />
    <DrawerField
      label="סכום עקיפה"
      value={model.overrideAmount != null ? formatShekelAmount(model.overrideAmount) : null}
    />
    <DrawerField
      label="שיטת תשלום"
      value={model.paymentMethod ? getAdvancePaymentMethodLabel(model.paymentMethod) : null}
    />
    <DrawerField label="תאריך ביצוע" value={model.paidAt ? formatDate(model.paidAt) : null} />
    <DrawerField label="הערות" value={model.notes} />
  </DrawerSection>
)

AdvancePaymentReadonlySections.displayName = 'AdvancePaymentReadonlySections'
