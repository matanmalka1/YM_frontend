import { Card } from '@/components/ui/primitives/Card'
import { DefinitionList } from '@/components/ui/layout/DefinitionList'
import { EntityAuditTrailSection } from '@/features/audit'
import type { BusinessResponse, ClientRecordResponse } from '@/features/clients'
import { BusinessNotesCard } from '@/features/notes'
import { BUSINESS_DETAILS_COPY } from '../constants'
import { buildBusinessSummaryItems } from '../utils'

type BusinessDetailsCardProps = {
  business: BusinessResponse
  client: ClientRecordResponse | null
  canEdit?: boolean
}

export const BusinessDetailsCard = ({ business, client, canEdit = false }: BusinessDetailsCardProps) => {
  return (
    <div className="space-y-6">
      <Card title={BUSINESS_DETAILS_COPY.sectionTitle}>
        <DefinitionList columns={4} items={buildBusinessSummaryItems(business, client)} />
      </Card>

      <EntityAuditTrailSection
        entityType="business"
        entityId={business.id}
        title="יומן שינויים"
        subtitle="שינויים שבוצעו בפרטי העסק"
      />

      {client && <BusinessNotesCard clientId={client.id} businessId={business.id} canEdit={canEdit} />}
    </div>
  )
}
