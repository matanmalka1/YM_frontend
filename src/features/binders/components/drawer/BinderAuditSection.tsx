import { EntityAuditTrailSection, type FieldValueLabels } from '@/features/audit'
import { BINDER_LOCATION_STATUS_LABELS, BINDER_CAPACITY_STATUS_LABELS } from '../../constants'
import { BINDERS_MESSAGES } from '../../messages'

const AUDIT_FIELD_VALUE_LABELS: FieldValueLabels = {
  location_status: BINDER_LOCATION_STATUS_LABELS,
  capacity_status: BINDER_CAPACITY_STATUS_LABELS,
}

interface BinderAuditSectionProps {
  binderId: number
}

export const BinderAuditSection: React.FC<BinderAuditSectionProps> = ({ binderId }) => (
  <EntityAuditTrailSection
    entityType="binder"
    entityId={binderId}
    title={BINDERS_MESSAGES.audit.title}
    fieldValueLabels={AUDIT_FIELD_VALUE_LABELS}
  />
)
