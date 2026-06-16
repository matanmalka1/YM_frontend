import { DrawerSection, DrawerField } from '../../../../components/ui/overlays/DetailDrawer'
import { formatShekelAmount } from '@/utils/utils'
import { formatDate } from '../../../../utils/utils'
import { formatAdvanceRate } from './advancePaymentDrawer.model'
import type { AdvancePaymentDrawerModel } from './advancePaymentDrawer.model'

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
    <DrawerField label="שיטת תשלום" value={model.paymentMethod ?? null} />
    <DrawerField label="תאריך ביצוע" value={model.paidAt ? formatDate(model.paidAt) : null} />
    <DrawerField label="הערות" value={model.notes} />
  </DrawerSection>
)

AdvancePaymentReadonlySections.displayName = 'AdvancePaymentReadonlySections'
