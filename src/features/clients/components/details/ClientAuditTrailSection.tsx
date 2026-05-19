import { EntityAuditTrailSection, type FieldValueLabels } from '@/features/audit'
import {
  ADVANCE_PAYMENT_FREQUENCY_LABELS,
  CLIENT_STATUS_LABELS,
  ENTITY_TYPE_LABELS,
  VAT_TYPE_LABELS,
} from '../../constants'

const FIELD_VALUE_LABELS: FieldValueLabels = {
  entity_type: ENTITY_TYPE_LABELS,
  client_type: ENTITY_TYPE_LABELS,
  status: CLIENT_STATUS_LABELS,
  vat_reporting_frequency: VAT_TYPE_LABELS,
  advance_payment_frequency: ADVANCE_PAYMENT_FREQUENCY_LABELS,
}

type ClientAuditTrailSectionProps = {
  clientId: number
}

export const ClientAuditTrailSection: React.FC<ClientAuditTrailSectionProps> = ({ clientId }) => (
  <EntityAuditTrailSection
    entityType="client"
    entityId={clientId}
    title="יומן שינויים"
    subtitle="פעולות שבוצעו על הלקוח"
    fieldValueLabels={FIELD_VALUE_LABELS}
  />
)

ClientAuditTrailSection.displayName = 'ClientAuditTrailSection'
