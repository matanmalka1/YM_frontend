import { Card } from '@/components/ui/primitives/Card'
import { DefinitionList } from '@/components/ui/layout/DefinitionList'
import { EntityAuditTrailSection, type FieldValueLabels } from '@/features/audit'
import type { BusinessResponse, ClientRecordResponse } from '@/features/clients'
import { BusinessNotesCard } from '@/features/notes'
import { BUSINESS_DETAILS_COPY, BUSINESS_STATUS_LABELS } from '../constants'
import { buildBusinessSummaryItems } from '../utils'

const FIELD_VALUE_LABELS: FieldValueLabels = {
  status: BUSINESS_STATUS_LABELS,
}

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
        fieldValueLabels={FIELD_VALUE_LABELS}
      />

      {client && <BusinessNotesCard clientId={client.id} businessId={business.id} canEdit={canEdit} />}
    </div>
  )
}
