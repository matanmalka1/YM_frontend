import { EntityAuditTrailSection } from '@/features/audit'

type ClientAuditTrailSectionProps = {
  clientId: number
}

export const ClientAuditTrailSection: React.FC<ClientAuditTrailSectionProps> = ({ clientId }) => (
  <EntityAuditTrailSection entityType="client" entityId={clientId} />
)

ClientAuditTrailSection.displayName = 'ClientAuditTrailSection'
